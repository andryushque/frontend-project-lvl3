import { watch } from 'melanke-watchjs';

const body = document.querySelector('body');
const inputForm = document.getElementById('url');
const button = document.querySelector('.btn');
const message = document.getElementById('message');

const createFeed = (title, description, itemsColl) => {
  const divFeed = document.createElement('div');
  divFeed.classList.add('container', 'd-flex', 'mb-4');

  const divFeedInfo = document.createElement('div');
  divFeedInfo.classList.add('col-3');

  const divFeedPost = document.createElement('div');
  divFeedPost.classList.add('col-9');

  const feedTitle = document.createElement('h4');
  feedTitle.innerText = title;

  const feedDescription = document.createElement('p');
  feedDescription.innerText = description;

  divFeedInfo.append(feedTitle, feedDescription);

  const items = Object.values(itemsColl);
  // items.length = 5; // => limit?
  items.forEach((item) => {
    const { postTitle, postLink } = item;
    const li = document.createElement('li');
    const urlLink = document.createElement('a');
    urlLink.href = postLink;
    urlLink.innerText = postTitle;

    li.append(urlLink);
    divFeedPost.append(li);
  });

  divFeed.append(divFeedInfo, divFeedPost);
  body.append(divFeed);
};


const createMessage = (resultMessage) => {
    if (document.querySelector('.message')) {
        document.querySelector('.message').remove();
    };
    const divMessage = document.createElement('div');
    divMessage.classList.add('message', 'container', 'invalid-feedback', 'd-block');
    divMessage.innerText = resultMessage;
    message.append(divMessage);
};


const render = (state) => {
  const { form, feed, validateResultMessage } = state;

  watch(form, 'validationState', () => {
    if (form.validationState) {
      button.disabled = !form.validationState; // => false
      inputForm.classList.remove('is-invalid');
      inputForm.classList.add('is-valid');
      createMessage(state.validateResultMessage);
    } else {
      button.disabled = !form.validationState; // => true
      inputForm.classList.remove('is-valid');
      inputForm.classList.add('is-invalid');
      createMessage(state.validateResultMessage);
    }
  });

  watch(form, 'inputProcessState', () => {
    if (form.inputProcessState === 'done') {
      inputForm.classList.remove('is-valid');
      inputForm.classList.remove('is-invalid');
      inputForm.value = '';
      if (document.querySelector('.message')) {
        document.querySelector('.message').remove();
      };
      state.validateResultMessage = '';
      button.disabled = true;
    };
  });

  watch(feed, 'currentPosts', () => {
    const title = feed.currentPosts.title;
    const description = feed.currentPosts.description;
    const feedPosts = feed.currentPosts.feedPosts;
    createFeed(title, description, feedPosts);
  });
};

export default render;
