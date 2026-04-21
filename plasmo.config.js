export const config = {
  manifest: {
    permissions: [
      "tabs",
      "storage",
      "activeTab"
    ],
    background: {
      "service_worker": "background.js"
    },
    host_permissions: [
      "https://*/*",
      "http://*/*"
    ]
  }
}