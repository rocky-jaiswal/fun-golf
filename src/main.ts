import './css/style.css';
import { createApp } from './app';

document.addEventListener('DOMContentLoaded', () => {
  createApp().catch(console.error);
});
