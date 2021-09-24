export default function UpdateBanner() {
  return (
    <button
      id="update-banner"
      className="hidden w-full py-1 font-semibold text-center text-blue-900 bg-blue-300"
      onClick={updateAndReloadApp}
    >
      A new version of Notabase is available. Click here to reload the app.
    </button>
  );
}

const updateAndReloadApp = () => {
  const wb = window.workbox;

  // Reload the app once the new service worker is controlling it
  wb.addEventListener('controlling', () => window.location.reload());

  // Send a message to the waiting service worker, instructing it to activate.
  wb.messageSkipWaiting();
};
