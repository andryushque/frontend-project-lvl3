const domParser = new DOMParser();

const parse = (data) => {
  const parsedData = domParser.parseFromString(data, 'text/xml');
  const feedTitle = parsedData.querySelector('title').textContent;
  const feedDescription = parsedData.querySelector('description').textContent;
  const feedInfo = { feedTitle, feedDescription };

  const feedPosts = [];
  const items = parsedData.querySelectorAll('item');
  items.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const feedPost = { postTitle, postLink };
    feedPosts.push(feedPost);
  });

  return {
    feedInfo,
    feedPosts,
  };
};

export default parse;
