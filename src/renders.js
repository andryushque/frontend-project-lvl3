import { watch } from 'melanke-watchjs';
import _ from 'lodash';

const inputField = document.getElementById('url');
const button = document.querySelector('.btn');
const message = document.getElementById('message');
const feedChannelsList = document.querySelector('.feedChannelsList');
const feedPostsList = document.querySelector('.feedPostsList');
const feedPostsCount = document.querySelector('.count');

const renderfeedChannelsList = (title, description) => {
  const feedTitle = document.createElement('h5');
  feedTitle.innerText = title;
  const feedDescription = document.createElement('div');
  feedDescription.classList.add('text-secondary');
  feedDescription.innerText = description;

  const feedList = document.createElement('div');
  const hr = document.createElement('hr');
  feedList.classList.add('mb-4');
  feedList.append(feedTitle, feedDescription);
  feedChannelsList.prepend(feedList, hr);
};

const renderfeedPostsList = (posts) => {
  posts.forEach((post) => {
    const { postTitle, postLink } = post;
    const postItemLink = document.createElement('a');
    const postItem = document.createElement('li');
    postItemLink.innerText = postTitle;
    postItemLink.href = postLink;
    postItem.classList.add('feedPost');
    postItem.id = _.uniqueId('post_');
    postItem.append(postItemLink);
    feedPostsList.prepend(postItem);
  });
};

const renderFeedPostsCount = (count) => {
  feedPostsCount.innerText = count;
  feedPostsCount.classList.add('text-dark');
};

const renderErrorMessage = (errorMessage, feedbackTypeClass) => {
  if (document.querySelector('.errorMessage')) {
    document.querySelector('.errorMessage').remove();
  }
  const errorMessageContainer = document.createElement('div');
  errorMessageContainer.classList.add('errorMessage', 'container', 'd-block', 'mt-2', feedbackTypeClass);
  errorMessageContainer.innerText = errorMessage;
  message.append(errorMessageContainer);
};

const render = (state) => {
  const { form } = state;

  watch(state, 'form', () => {
    if (form.inputProcessState === 'done') {
      if (document.querySelector('.errorMessage')) {
        document.querySelector('.errorMessage').remove();
      }
      inputField.classList.remove('is-valid', 'is-invalid');
      inputField.value = '';
      button.disabled = true;
    } else {
      button.disabled = true;
      switch (form.validationState) {
        case 'valid':
          inputField.classList.remove('is-invalid');
          inputField.classList.add('is-valid');
          button.disabled = false;
          break;
        case 'invalid':
          inputField.classList.remove('is-valid');
          inputField.classList.add('is-invalid');
          break;
        default:
          inputField.classList.remove('is-valid', 'is-invalid');
      }
    }
  });

  watch(state, 'validateResultMessage', () => {
    renderErrorMessage(state.validateResultMessage, 'invalid-feedback');
  });

  watch(state, 'errorMessage', () => {
    renderErrorMessage(state.errorMessage, 'alert-danger');
  });

  watch(state, 'currentPosts', () => {
    const currentFeedTitle = state.currentPosts.feedTitle;
    const currentFeedDescription = state.currentPosts.feedDescription;
    const currentFeedPosts = Object.values(state.currentPosts.feedPosts).reverse();
    renderfeedChannelsList(currentFeedTitle, currentFeedDescription);
    renderfeedPostsList(currentFeedPosts);
  });

  watch(state, 'newPosts', () => {
    renderfeedPostsList(state.newPosts);
  });

  watch(state, 'allPostsCount', () => {
    renderFeedPostsCount(state.allPostsCount);
  });
};

export default render;
