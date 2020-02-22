import { watch } from 'melanke-watchjs';
import _ from 'lodash';

export default (state) => {
  const { form } = state;
  const inputField = document.getElementById('url');
  const button = document.querySelector('.btn');
  const message = document.getElementById('message');
  const channelsList = document.querySelector('.channelsList');
  const postsList = document.querySelector('.postsList');
  const postsCount = document.getElementById('postsCount');

  const renderChannelsList = (channels) => {
    channels.forEach((channel) => {
      const { title, description } = channel;
      const channelTitle = document.createElement('h5');
      channelTitle.innerText = title;
      const channelDescription = document.createElement('div');
      channelDescription.classList.add('text-secondary');
      channelDescription.innerText = description;

      const channelItem = document.createElement('div');
      const underline = document.createElement('hr');
      channelItem.classList.add('mb-4');
      channelItem.id = _.uniqueId('channel_');
      channelItem.append(channelTitle, channelDescription);
      channelsList.prepend(channelItem, underline);
    });
  };

  const renderPostsList = (posts) => {
    posts.forEach((post) => {
      const { postTitle, postLink } = post;
      const postItemLink = document.createElement('a');
      const postItem = document.createElement('li');
      postItemLink.innerText = postTitle;
      postItemLink.href = postLink;
      postItem.classList.add('feedPost');
      postItem.id = _.uniqueId('post_');
      postItem.append(postItemLink);
      postsList.prepend(postItem);
    });
  };

  const renderPostsCount = (count) => {
    const current = Number(postsCount.innerText);
    postsCount.innerText = current + count;
    postsCount.classList.add('text-dark');
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

  watch(state, 'channels', () => {
    renderChannelsList(state.channels);
  });

  watch(state, 'posts', () => {
    renderPostsList(state.posts);
    renderPostsCount(state.posts.length);
  });
};
