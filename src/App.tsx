import './App.css';
import { useState, useEffect, useRef } from 'react';
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: 'nwZMtuOy7LDSYpaeQerHWzVxODju-9Hb-ijgmbwaGg0',
});

function App() {
  const [sentence, setSentence] = useState('');
  const sentenceRef = useRef(sentence);
  const [images, setImages] = useState([]);
  const imagesRef = useRef(images);
  const [fetching, setFetching] = useState(false);
  const fetchingRef = useRef(fetching);

  const fetchUnsplashImages = (query: string, page: number = 1) => {
    setFetching(true);
    fetchingRef.current = true;
    return new Promise((resolve, reject) => {
      unsplash.search
        .getPhotos({
          query,
          page: page,
          perPage: 5,
        })
        .then((result) => {
          setFetching(false);
          fetchingRef.current = false;
          const images = result.response?.results.map((result) => result.urls.regular);
          resolve(images);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  useEffect(() => {
    sentenceRef.current = sentence;
    if (sentence !== '') {
      setTimeout(() => {
        fetchUnsplashImages(sentence).then((images) => {
          setImages(images);
          imagesRef.current = images;
        });
      }, 2000);
    }
  }, [sentence]);

  const handleScroll = () => {
    const { scrollHeight, scrollTop, clientHeight } = document.scrollingElement;
    const isBottom = scrollHeight - scrollTop <= clientHeight;
    if (isBottom && !fetchingRef.current) {
      const currentPage = imagesRef.current.length / 5 + 1;
      fetchUnsplashImages(sentenceRef.current, currentPage).then((newImages) => {
        imagesRef.current = [...imagesRef.current, ...newImages];
        setImages(imagesRef.current);
      });
    }
  };

  useEffect(() => {
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="App">
      <div className="header">
        <h1>Picsearch</h1>
        <input placeholder='Search for quality images...' type="text" value={sentence} onChange={(e) => setSentence(e.target.value)} />
      </div>
      <div>{fetching && 'Fetching'}</div>
      {images.length > 0 &&
        images.map((url,index) => (
          <ul className="gallery" key={url}>
            <li key={index}>
              <img src={url} alt="unsplash" />
            </li>
          </ul>
        ))}
    </div>
  );
}

export default App
