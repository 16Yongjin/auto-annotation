export const isSystemDarkMode = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

type DarkModeHandler = (mode: boolean) => void

export const onSystemDarkModeChange = (handler: DarkModeHandler) => {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      handler(e.matches)
    })
}
