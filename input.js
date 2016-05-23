import {thePicker} from './picker.js';
import locales from './locales.js';

export default class Input {
  constructor(input) {
    this.element = input;
    this.element.setAttribute(`data-has-picker`, ``);

    this.locale =
      this.element.getAttribute(`lang`)
      || document.body.getAttribute(`lang`)
      || `en`;

    this.localeText = this.getLocaleText();

    Object.defineProperties(
      this.element,
      {
        'valueAsDate': {
          get: ()=> {
            if (!this.element.value) {
              return null;
            }

            const val = this.element.value.split(/\D/);
            return new Date(`${val[0]}-${`0${val[1]}`.slice(-2)}-${`0${val[2]}`.slice(-2)}`);
          },
          set: val=> {
            this.element.value = this.formatLocalDate(val).slice(0, 10);
          }
        },
        'valueAsNumber': {
          get: ()=> {
            if (!this.element.value) {
              return NaN;
            }

            return this.element.valueAsDate.getTime();
          },
          set: val=> {
            this.element.valueAsDate = new Date(val);
          }
        }
      }
    );

    // Open the picker when the input get focus,
    // also on various click events to capture it in all corner cases.
    const showPicker = ()=> {
      thePicker.attachTo(this.element);
    };
    this.element.addEventListener(`focus`, showPicker);
    this.element.addEventListener(`mousedown`, showPicker);
    this.element.addEventListener(`mouseup`, showPicker);

    // Update the picker if the date changed manually in the input.
    this.element.addEventListener(`keydown`, e=> {
      const date = new Date();

      switch (e.keyCode) {
        case 27:
          thePicker.hide();
          break;
        case 38:
          if (this.element.valueAsDate) {
            date.setDate(this.element.valueAsDate.getDate() + 1);
            this.element.valueAsDate = date;
            thePicker.pingInput();
          }
          break;
        case 40:
          if (this.element.valueAsDate) {
            date.setDate(this.element.valueAsDate.getDate() - 1);
            this.element.valueAsDate = date;
            thePicker.pingInput();
          }
          break;
        default:
          break;
      }

      thePicker.sync();
    });
  }

  formatLocalDate(d) {
    const tzo = -d.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = (num) => {
        const norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
      };
    return d.getFullYear()
      + '-' + pad(d.getMonth() + 1)
      + '-' + pad(d.getDate())
      + 'T' + pad(d.getHours())
      + ':' + pad(d.getMinutes())
      + ':' + pad(d.getSeconds())
      + dif + pad(tzo / 60)
      + ':' + pad(tzo % 60);
  }

  getLocaleText() {
    const locale = this.locale.toLowerCase();

    for (const localeSet in locales) {
      const localeList = localeSet.split(`_`);
      localeList.map(el=>el.toLowerCase());

      if (
        !!~localeList.indexOf(locale)
        || !!~localeList.indexOf(locale.substr(0, 2))
      ) {
        return locales[localeSet];
      }
    }
  }

  // Return false if the browser does not support input[type="date"].
  static supportsDateInput() {
    const input = document.createElement(`input`);
    input.setAttribute(`type`, `date`);

    const notADateValue = `not-a-date`;
    input.setAttribute(`value`, notADateValue);

    return !(input.value === notADateValue);
  }

  // Will add the Picker to all inputs in the page.
  static addPickerToDateInputs() {
    // Get and loop all the input[type="date"]s in the page that do not have `[data-has-picker]` yet.
    const dateInputs = document.querySelectorAll(`input[type="date"]:not([data-has-picker])`);
    const length = dateInputs.length;

    if (!length) {
      return false;
    }

    for (let i = 0; i < length; ++i) {
      new Input(dateInputs[i]);
    }
  }
}
