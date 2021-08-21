const refs = {
  searchForm: document.querySelector('.search-form'),
  searchBtn: document.querySelector('.search-btn'),
  loadMoreRef: document.querySelector('#load-more'),
  galleryRef: document.querySelector('.gallery'),
};

// api-service import:
import ImgApiService from './apiService';

// handlebars for markup:
import galleryMarkup from '../templates/images_markup.hbs';

// basic lightbox modal window on image press:
import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/dist/basicLightbox.min.css';

// callback to handle opening large img in modal
function onModalOpen(event) {
  if (event.target.nodeName !== 'IMG') {
    return;
  }

  event.preventDefault();
  const imgToShow = `<img src= ${event.target.dataset.source}>`;
  const instance = basicLightbox.create(imgToShow);
  instance.show();
}

export { onModalOpen };

// import toast notifier
import nativeToast from 'native-toast';

// creating Image API service class instance:
const imgApiService = new ImgApiService();

// listening to form submit:
refs.searchForm.addEventListener('submit', onSearch);

// handling image press to open it large in modal:
refs.galleryRef.addEventListener('click', onModalOpen);

// callback for handling form submit or search-btn press:
function onSearch(event) {
  event.preventDefault();

  imgApiService.query = event.currentTarget.elements.query.value;

  if (imgApiService.query === '') {
    return alert('👀 Looks like you typed no word');
  }

  imgApiService.resetPage();
  clearGallery();
  fetchImgs();
  nativeToast({
    message: 'Loaded pics for you! ✌😊',
    position: 'north-east',
    timeout: 5000,
    type: 'success',
    closeOnClick: true,
  });
  observer.observe(refs.loadMoreRef);
}

// callback for image fetching:
async function fetchImgs() {
  try {
    const fetchOutput = await imgApiService.fetchImgs();
    appendImgsMarkup(fetchOutput);
  } catch (error) {
    nativeToast({
      message: 'Something went wrong 😒',
      position: 'north-east',
      timeout: 5000,
      type: 'error',
      closeOnClick: true,
    });
  }
}

function appendImgsMarkup(images) {
  refs.galleryRef.insertAdjacentHTML('beforeend', galleryMarkup(images));
}

function clearGallery() {
  refs.galleryRef.innerHTML = '';
}

// adding intersectionObserver for infinite scrolling:
const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && imgApiService.query !== '') {
      imgApiService.fetchImgs().then(images => {
        if (images.length < 1) {
          nativeToast({
            message: 'No images to display 😢',
            position: 'south-east',
            timeout: 5000,
            type: 'error',
            closeOnClick: true,
          });
          observer.unobserve(refs.loadMoreRef);
          return;
        }

        appendImgsMarkup(images);
        imgApiService.incrementPage();
      });
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '160px',
});
