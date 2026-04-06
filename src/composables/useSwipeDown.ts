import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Detects a swipe-down gesture on a target element and calls onClose.
 * The panel element translates with the finger and snaps back or closes.
 */
export function useSwipeDown(panelRef: Ref<HTMLElement | null>, onClose: () => void) {
  const translateY = ref(0)
  const dragging = ref(false)
  let startY = 0
  let startTime = 0

  function onTouchStart(e: TouchEvent) {
    const el = panelRef.value
    if (!el) return
    // Only start swipe if at scroll top
    if (el.scrollTop > 0) return
    startY = e.touches[0].clientY
    startTime = Date.now()
    dragging.value = true
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging.value) return
    const dy = e.touches[0].clientY - startY
    if (dy < 0) {
      translateY.value = 0
      return
    }
    translateY.value = dy
  }

  function onTouchEnd() {
    if (!dragging.value) return
    dragging.value = false
    const dy = translateY.value
    const dt = Date.now() - startTime
    const velocity = dy / dt

    // Close if dragged far enough or fast enough
    if (dy > 100 || velocity > 0.5) {
      translateY.value = 0
      onClose()
    } else {
      translateY.value = 0
    }
  }

  onMounted(() => {
    const el = panelRef.value
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = panelRef.value
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
  })

  return { translateY, dragging }
}
