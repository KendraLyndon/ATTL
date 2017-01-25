var attlApp = angular.module('attlApp');

attlApp.factory('HomeService', function(){
  return {
    showtimes : [
      {
        day: 'Friday',
        date: 'March 24',
        time: '7 pm'
      },
      {
        day: 'Saturday',
        date: 'March 25',
        time: '7 pm'
      },
      {
        day: 'Sunday',
        date: 'March 26',
        time: '3 pm'
      },
      {
        day: 'Friday',
        date: 'March 31',
        time: '7 pm'
      },
      {
        day: 'Saturday',
        date: 'April 1',
        time: '7 pm'
      },
      {
        day: 'Sunday',
        date: 'April 2',
        time: '3 pm'
      }
    ],
    photos : [
      {
        icon: 'app/img/puppy1.jpg',
        fullSize: 'app/img/puppy1.jpg'
      },
      {
        icon: 'app/img/puppy2.jpg',
        fullSize: 'app/img/puppy2.jpg'
      },
      {
        icon: 'app/img/puppy3.jpg',
        fullSize: 'app/img/puppy3.jpg'
      },
      {
        icon: 'app/img/puppy4.jpg',
        fullSize: 'app/img/puppy4.jpg'
      },
      {
        icon: 'app/img/placeholder.jpg',
        fullSize: 'app/img/placeholder.jpg'
      },
      {
        icon: 'app/img/puppy3.jpg',
        fullSize: 'app/img/puppy3.jpg'
      },
      {
        icon: 'app/img/puppy1.jpg',
        fullSize: 'app/img/puppy1.jpg'
      },
      {
        icon: 'app/img/puppy2.jpg',
        fullSize: 'app/img/puppy2.jpg'
      },
    ]
  }
})
