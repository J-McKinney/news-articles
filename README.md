# News-Articles

* I Created an app that accomplishes the following:

  1. Whenever a user visits my site, the app will scrape stories from The New York Times and display them for the user. Each scraped article is saved to the application database. The app scrapes and displays the following information for each article:

     * Headline - the title of the article

     * Summary - a short summary of the article

     * URL - the url to the original article

  2. Users should also be able to leave comments on the articles displayed and revisit them later. The comments are saved to the database as well and associated with their articles. Users are also able to delete comments left on articles. All stored comments are visible to every user.

    * All articles are represented once for the user and in the database
    * My app deletes stories every time someone visits, the users won't be able to see any comments except the ones that they post.

    3. Deployed on heroku:
    
     https://rocky-stream-76978.herokuapp.com/