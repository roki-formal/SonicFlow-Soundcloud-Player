// Setup mocks for Node.js test environment

if (typeof window === 'undefined') {
  (global as any).window = {};
}

if (typeof document === 'undefined' || !(global as any).document?.getElementById) {
  const elements: Record<string, any> = {};
  (global as any).document = {
    head: {
      appendChild: (node: any) => {
        if (node.id) elements[node.id] = node;
      },
    },
    getElementById: (id: string) => elements[id] || null,
    createElement: (tag: string) => {
      const el = { id: '', textContent: '', tag };
      return el;
    },
    documentElement: {
      setAttribute: () => {},
      style: {
        setProperty: () => {},
        colorScheme: '',
      },
    },
  };
}

if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
}
