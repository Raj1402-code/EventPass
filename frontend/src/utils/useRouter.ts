export function useRouter() {
  return {
    push: (path: string) => {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    },
    replace: (path: string) => {
      window.history.replaceState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };
}
