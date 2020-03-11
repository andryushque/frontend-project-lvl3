import * as yup from 'yup';

const isUrlValid = (rssUrl) => yup
  .string()
  .url()
  .required()
  .isValidSync(rssUrl);

const isUrlDuplicated = (rssUrl, urlsList) => urlsList.includes(rssUrl);

export { isUrlValid, isUrlDuplicated };
