import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const btn = document.querySelector('[data-start]');
const input = document.querySelector('#datetime-picker');
const displDays = document.querySelector('[data-days]');
const displHours = document.querySelector('[data-hours]');
const displMin = document.querySelector('[data-minutes]');
const displSeconds = document.querySelector('[data-seconds]');

btn.disabled = true;

let startTime = null;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,

  onClose(selectedDates) {
    const selected = selectedDates[0];
    if (selected <= new Date()) {
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
      });
      btn.disabled = true;
    } else {
      startTime = selected;
      btn.disabled = false;
    }
  },
};
flatpickr(input, options);

class Timer {
  constructor({ onTick }) {
    this.onTick = onTick;
    this.interval = null;
    this.isActive = false;
  }

  start() {
    if (this.isActive) {
      this.reset();
      return;
    }

    const currentTime = Date.now();
    const deltaTime = startTime - currentTime;

    if (deltaTime <= 0) return;

    this.isActive = true;
    btn.textContent = 'Reset';
    input.disabled = true;

    this.interval = setInterval(() => {
      const now = Date.now();
      const remaining = startTime - now;

      if (remaining <= 0) {
        clearInterval(this.interval);
        this.onTick(this.convertMs(0));
        this.isActive = false;
        btn.textContent = 'Start';
        input.disabled = false;
        return;
      }

      const time = this.convertMs(remaining);
      this.onTick(time);
    }, 1000);
  }
  reset() {
    clearInterval(this.interval);
    this.isActive = false;
    this.onTick(this.convertMs(0));
    input.disabled = false;
    input.value = '';
    btn.textContent = 'Start';
    btn.disabled = true;
    startTime = null;
  }

  convertMs(ms) {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = Math.floor(ms / day);
    const hours = Math.floor((ms % day) / hour);
    const minutes = Math.floor(((ms % day) % hour) / minute);
    const seconds = Math.floor((((ms % day) % hour) % minute) / second);

    return { days, hours, minutes, seconds };
  }
}

function updateTime({ days, hours, minutes, seconds }) {
  displDays.textContent = String(days).padStart(2, '0');
  displHours.textContent = String(hours).padStart(2, '0');
  displMin.textContent = String(minutes).padStart(2, '0');
  displSeconds.textContent = String(seconds).padStart(2, '0');
}

const timer = new Timer({ onTick: updateTime });

btn.addEventListener('click', timer.start.bind(timer));
