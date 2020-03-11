import { watch } from 'melanke-watchjs';
import i18next from 'i18next';

export default (state) => {
  const { form } = state;
  const inputField = document.getElementById('url');
  const button = document.querySelector('.btn');
  const errorMessage = document.getElementById('errorMessage');
  const channelsList = document.querySelector('.channelsList');
  const postsList = document.querySelector('.postsList');
  const postsCount = document.getElementById('postsCount');

  const renderChannelsList = (channels) => {
    channels.forEach((channel) => {
      const { title, description, channelId } = channel;
      if (!document.getElementById(channelId)) {
        const channelTitle = document.createElement('h5');
        channelTitle.innerText = title;
        const channelDescription = document.createElement('div');
        channelDescription.classList.add('text-secondary');
        channelDescription.innerText = description;
        const channelItem = document.createElement('div');
        const underline = document.createElement('hr');
        channelItem.classList.add('mb-4');
        channelItem.id = channelId;
        channelItem.append(channelTitle, channelDescription);
        channelsList.prepend(channelItem, underline);
      }
    });
  };

  const renderPostsList = (posts) => {
    posts.forEach((post) => {
      const { postTitle, postLink, postId } = post;
      if (!document.getElementById(postId)) {
        const postItemLink = document.createElement('a');
        const postItem = document.createElement('li');
        postItemLink.innerText = postTitle;
        postItemLink.href = postLink;
        postItem.classList.add('feedPost');
        postItem.id = postId;
        postItem.append(postItemLink);
        postsList.prepend(postItem);
      }
    });
  };

  const renderPostsCount = (count) => {
    postsCount.innerText = count;
    postsCount.classList.add('text-dark');
  };

  const removeErrorMessage = () => {
    if (document.querySelector('.errorMessage')) {
      document.querySelector('.errorMessage').remove();
    }
  };

  const renderErrorMessage = (errors) => {
    removeErrorMessage();
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.classList.add('errorMessage', 'container', 'd-block', 'mt-2');
    const { err, type } = errors;
    const interval = 4000;

    if (type === 'httpClient') {
      switch (err) {
        case 404: case 406: case 500:
          errorMessageContainer.innerText = i18next.t(`${type}.error${err}`);
          break;
        case 'Network Error':
          errorMessageContainer.innerText = i18next.t(`${type}.networkError`);
          break;
        default:
          errorMessageContainer.innerText = i18next.t(`${type}.unknownError`);
      }
      errorMessageContainer.classList.add('alert-danger');
      errorMessage.append(errorMessageContainer);
      setTimeout(removeErrorMessage, interval);
    }

    if (type === 'input') {
      errorMessageContainer.innerText = i18next.t(`${type}.${err}`);
      errorMessageContainer.classList.add('invalid-feedback');
      errorMessage.append(errorMessageContainer);
    }
  };

  watch(state, 'form', () => {
    if (form.inputProcessState === 'done') {
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
        case 'notValidated':
          inputField.classList.remove('is-valid', 'is-invalid');
          break;
        default:
          throw new Error(`Unknown validation state: ${form.validationState}`);
      }
    }
  });

  watch(state, 'errors', () => {
    renderErrorMessage(state.errors);
  });

  watch(state, 'channels', () => {
    renderChannelsList(state.channels);
  });

  watch(state, 'posts', () => {
    renderPostsList(state.posts);
    renderPostsCount(state.posts.length);
  });
};
