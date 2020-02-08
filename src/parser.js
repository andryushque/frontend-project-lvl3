const domParser = new DOMParser();

const parse = (data) => {
  const parsedData = domParser.parseFromString(data, 'text/xml');
  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;

  const feedPosts = [];
  const items = parsedData.querySelectorAll('item');
  items.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const feedPost = { postTitle, postLink };
    feedPosts.push(feedPost);
  });

  return {
    title,
    description,
    feedPosts,
  };
};

export default parse;
