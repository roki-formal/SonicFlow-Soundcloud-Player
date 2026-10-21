using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Collections.Generic;

namespace SonicFlowLauncher
{
    static class Program
    {
        private static HttpListener _listener;
        private static string _webRoot;
        private static bool _isRunning = true;

        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                _webRoot = Path.Combine(baseDir, "dist");

                // If dist folder doesn't exist directly, check parent folder or current folder
                if (!Directory.Exists(_webRoot) && File.Exists(Path.Combine(baseDir, "index.html")))
                {
                    _webRoot = baseDir;
                }

                if (!Directory.Exists(_webRoot) || !File.Exists(Path.Combine(_webRoot, "index.html")))
                {
                    System.Windows.Forms.MessageBox.Show(
                        "Директория с файлами приложения ('dist') не найдена!\nПожалуйста, убедитесь, что приложение собрано (npm run build).",
                        "SonicFlow — Ошибка запуска",
                        System.Windows.Forms.MessageBoxButtons.OK,
                        System.Windows.Forms.MessageBoxIcon.Error
                    );
                    return;
                }

                int port = GetFreePort();
                string url = "http://127.0.0.1:" + port + "/";

                StartServer(port);

                // Launch in standalone App Mode
                Process appProcess = LaunchApp(url);

                if (appProcess != null)
                {
                    appProcess.WaitForExit();
                }
                else
                {
                    // If opened in default browser, keep running until user stops
                    while (_isRunning)
                    {
                        Thread.Sleep(1000);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show(
                    "Ошибка при запуске SonicFlow:\n" + ex.Message,
                    "SonicFlow",
                    System.Windows.Forms.MessageBoxButtons.OK,
                    System.Windows.Forms.MessageBoxIcon.Error
                );
            }
            finally
            {
                StopServer();
            }
        }

        private static int GetFreePort()
        {
            TcpListener l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return port;
        }

        private static void StartServer(int port)
        {
            _listener = new HttpListener();
            _listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
            _listener.Start();

            Thread serverThread = new Thread(ServerLoop);
            serverThread.IsBackground = true;
            serverThread.Start();
        }

        private static void StopServer()
        {
            _isRunning = false;
            try
            {
                if (_listener != null && _listener.IsListening)
                {
                    _listener.Stop();
                    _listener.Close();
                }
            }
            catch { }
        }

        private static void ServerLoop()
        {
            while (_isRunning && _listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem(ProcessRequest, context);
                }
                catch
                {
                    break;
                }
            }
        }

        private static void ProcessRequest(object state)
        {
            HttpListenerContext context = (HttpListenerContext)state;
            try
            {
                // Native API endpoint: Open URL in default system browser
                if (context.Request.Url.AbsolutePath.Equals("/api/open-browser", StringComparison.OrdinalIgnoreCase))
                {
                    string targetUrl = context.Request.QueryString["url"];
                    if (!string.IsNullOrEmpty(targetUrl) && (targetUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) || targetUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase)))
                    {
                        try
                        {
                            Process.Start(new ProcessStartInfo(targetUrl) { UseShellExecute = true });
                        }
                        catch { }
                    }
                    byte[] resp = Encoding.UTF8.GetBytes("{\"success\":true}");
                    context.Response.ContentType = "application/json";
                    context.Response.Headers["Access-Control-Allow-Origin"] = "*";
                    context.Response.StatusCode = (int)HttpStatusCode.OK;
                    context.Response.ContentLength64 = resp.Length;
                    context.Response.OutputStream.Write(resp, 0, resp.Length);
                    context.Response.OutputStream.Close();
                    return;
                }

                // SoundCloud API Proxy endpoint to bypass CORS and CloudFront origin restrictions
                if (context.Request.Url.AbsolutePath.StartsWith("/sc-api", StringComparison.OrdinalIgnoreCase))
                {
                    string subPath = context.Request.Url.AbsolutePath.Substring("/sc-api".Length);
                    string target = "https://api-v2.soundcloud.com" + subPath + context.Request.Url.Query;

                    try
                    {
                        // Enable TLS 1.2 in .NET 4.0
                        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls;

                        HttpWebRequest proxyReq = (HttpWebRequest)WebRequest.Create(target);
                        proxyReq.Method = context.Request.HttpMethod;
                        proxyReq.Headers["Origin"] = "https://soundcloud.com";
                        proxyReq.Referer = "https://soundcloud.com/";
                        proxyReq.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
                        proxyReq.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

                        if (!string.IsNullOrEmpty(context.Request.Headers["Authorization"]))
                        {
                            proxyReq.Headers["Authorization"] = context.Request.Headers["Authorization"];
                        }

                        using (HttpWebResponse proxyResp = (HttpWebResponse)proxyReq.GetResponse())
                        {
                            context.Response.StatusCode = (int)proxyResp.StatusCode;
                            context.Response.ContentType = proxyResp.ContentType;
                            context.Response.Headers["Access-Control-Allow-Origin"] = "*";
                            using (Stream inStream = proxyResp.GetResponseStream())
                            {
                                byte[] buffer = new byte[64 * 1024];
                                int bytesRead;
                                while ((bytesRead = inStream.Read(buffer, 0, buffer.Length)) > 0)
                                {
                                    context.Response.OutputStream.Write(buffer, 0, bytesRead);
                                }
                            }
                            context.Response.OutputStream.Close();
                            return;
                        }
                    }
                    catch (WebException webEx)
                    {
                        HttpWebResponse errResp = webEx.Response as HttpWebResponse;
                        if (errResp != null)
                        {
                            context.Response.StatusCode = (int)errResp.StatusCode;
                            context.Response.ContentType = errResp.ContentType;
                            context.Response.Headers["Access-Control-Allow-Origin"] = "*";
                            using (Stream inStream = errResp.GetResponseStream())
                            {
                                byte[] buffer = new byte[16 * 1024];
                                int bytesRead;
                                while ((bytesRead = inStream.Read(buffer, 0, buffer.Length)) > 0)
                                {
                                    context.Response.OutputStream.Write(buffer, 0, bytesRead);
                                }
                            }
                            context.Response.OutputStream.Close();
                            return;
                        }
                    }
                }

                string rawUrl = context.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(rawUrl))
                {
                    rawUrl = "index.html";
                }

                // Security check against directory traversal
                rawUrl = rawUrl.Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(_webRoot, rawUrl);

                // SPA fallback for routing
                if (!File.Exists(filePath))
                {
                    filePath = Path.Combine(_webRoot, "index.html");
                }

                string mimeType = GetMimeType(filePath);

                context.Response.ContentType = mimeType;
                context.Response.Headers["Access-Control-Allow-Origin"] = "*";
                context.Response.Headers["Cache-Control"] = "no-cache";

                using (FileStream fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    context.Response.ContentLength64 = fs.Length;
                    context.Response.StatusCode = (int)HttpStatusCode.OK;

                    byte[] chunk = new byte[64 * 1024];
                    int bytesRead;
                    while ((bytesRead = fs.Read(chunk, 0, chunk.Length)) > 0)
                    {
                        context.Response.OutputStream.Write(chunk, 0, bytesRead);
                    }
                }

                context.Response.OutputStream.Close();
            }
            catch
            {
                try
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.Close();
                }
                catch { }
            }
        }

        private static string GetMimeType(string path)
        {
            string ext = Path.GetExtension(path).ToLowerInvariant();
            switch (ext)
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".svg": return "image/svg+xml";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".ico": return "image/x-icon";
                case ".mp3": return "audio/mpeg";
                case ".wav": return "audio/wav";
                case ".ogg": return "audio/ogg";
                case ".woff2": return "font/woff2";
                case ".ttf": return "font/ttf";
                default: return "application/octet-stream";
            }
        }

        private static Process LaunchApp(string url)
        {
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            string chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
            string dataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SonicFlow", "Profile");

            string browserPath = null;
            if (File.Exists(edgePath)) browserPath = edgePath;
            else if (File.Exists(chromePath)) browserPath = chromePath;

            if (browserPath != null)
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = browserPath;
                psi.Arguments = string.Format(
                    "--app=\"{0}\" --window-size=1380,900 --user-data-dir=\"{1}\" --app-id=SonicFlowApp",
                    url, dataDir
                );
                psi.UseShellExecute = false;
                return Process.Start(psi);
            }
            else
            {
                // Fallback to default browser
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                return null;
            }
        }
    }
}
