import './style.css'
import { siteConfig } from './config.js'

document.querySelectorAll('.purchase-link').forEach((link) => {
  link.href = siteConfig.purchaseUrl
  if (!link.classList.contains('hero-purchase')) link.textContent = siteConfig.purchaseLabel
  if (!link.classList.contains('site-header')) {
    link.target = '_blank'
    link.rel = 'noopener'
  }
})

document.querySelectorAll('.sample-direct').forEach((link) => {
  link.href = siteConfig.samplePdf
})

const reader = document.querySelector('.reader')
const frame = document.querySelector('[data-pdf-frame]')
const openReader = () => {
  if (!frame.src) frame.src = `${siteConfig.samplePdf}#view=FitH`
  reader.showModal()
}

document.querySelectorAll('[data-open-reader]').forEach((button) => button.addEventListener('click', openReader))
document.querySelector('[data-close-reader]').addEventListener('click', () => reader.close())
reader.addEventListener('click', (event) => {
  if (event.target === reader) reader.close()
})

const galleryViewer = document.querySelector('.gallery-viewer')
const galleryImage = document.querySelector('[data-gallery-viewer-image]')
const galleryCaption = document.querySelector('[data-gallery-viewer-caption]')
let galleryTrigger

document.querySelectorAll('[data-gallery-image]').forEach((button) => {
  button.addEventListener('click', () => {
    galleryTrigger = button
    galleryImage.src = button.dataset.galleryImage
    galleryImage.alt = button.dataset.galleryCaption
    galleryCaption.textContent = button.dataset.galleryCaption
    galleryViewer.showModal()
  })
})
document.querySelector('[data-close-gallery]').addEventListener('click', () => galleryViewer.close())
galleryViewer.addEventListener('click', (event) => {
  const bounds = galleryViewer.getBoundingClientRect()
  if (event.target === galleryViewer && (
    event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
  )) galleryViewer.close()
})
galleryViewer.addEventListener('close', () => galleryTrigger?.focus({ preventScroll: true }))

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
  { threshold: 0.12 },
)
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))