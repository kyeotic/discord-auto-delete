export function scrollToCenter(
  el: HTMLElement,
  { smooth = true }: { smooth?: boolean } = {},
) {
  el.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'center',
    inline: 'center',
  })
}

export function scrollToTop() {
  // window.scrollTo(0, 0)

  // document.body.scrollTop = 0
  // setTimeout(
  //   () =>
  // window.scrollTo({
  //   top: 0,
  //   behavior: 'instant',
  // })
  // document.getElementById('app-nav')?.scrollIntoView()
  window.scrollTo(0, document.body.scrollHeight)
  // document.body.scrollTo({
  //   top: 0,
  //   behavior: 'instant',
  // })
  //   200,
  // )
}
