function updateSite(event) {
  window.location.reload(true)
}
window.applicationCache?.addEventListener('updateready', updateSite, false)
