import * as yup from 'yup';

const isUrlValid = (url) => yup
  .string()
  .url()
  .required()
  .isValidSync(url);

const isUrlDuplicated = (url, urls) => urls.includes(url);

const validate = (url, urls) => {
  const errors = {};
  if (isUrlValid(url) && isUrlDuplicated(url, urls)) {
    errors.type = 'input';
    errors.subType = 'addedUrl';
  } else if (!isUrlValid(url)) {
    errors.type = 'input';
    errors.subType = 'invalidUrl';
  }
  return errors;
};

export default validate;
