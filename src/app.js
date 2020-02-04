import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { watch } from 'melanke-watchjs';
import * as yup from 'yup';
// import axios from 'axios';

export default () => {
  // проверка валидности введенного url через yup (via regex)
  const checkoutFeedUrlSchema = yup
    .string()
    .url('Please enter a valid URL address.')
    .required('This field is required.');

  const isUrlValid = (url) => checkoutFeedUrlSchema
    .isValid(url) // => возвращается промис
    .then((valid) => valid);

  // состояние - процесс ввода url-адреса, статус валидности введенного адреса (true/false),
  // текущий url, состояние кнопки, список адресов
  const state = {
    form: {
      inputProcessState: 'inProcess', // 'inProcess', 'done'
      validationState: true,
      currentUrl: '',
      submitDisabled: false,
    },

    urlList: [],
  };

  const inputForm = document.getElementById('url');
  const button = document.querySelector('.btn');

  // обработчик - меняет состояние
  inputForm.addEventListener('input', (e) => {
      isUrlValid(e.target.value).then((valid) => {
      if (valid) {
          state.form.validationState = true;
          inputForm.classList.add('is-valid');
          inputForm.classList.remove('is-invalid');
        } else {
          state.form.validationState = false;
          inputForm.classList.add('is-invalid');
          inputForm.classList.remove('is-valid');
       }
      })
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.inputProcessState = 'done';
    button.disabled = false;
    // сначала добавляем адрес в список (добавлю код позже)
    // а затем обнуляем
    // state.form.currentUrl = '';
  });

  watch(state.form, 'validationState', () => {
    // если введенный адрес валидный, то кнопка активна
    button.disabled = state.form.validationState ? false : true;
     // console.log(state.form.validationState);
  });

  watch(state.form, 'inputProcessState', () => {
    if (state.form.inputProcessState === 'done') {
      button.disabled = false;
    }
  });
};

// код самую малость работает - адреса проходят валидацию
// добавление в список адресов, проверка на дубликат
// подобрать имена получше
// разобраться с классами поля ввода
