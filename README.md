<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/SayWess/Musicarr">
    <img src="images/logo.webp" alt="Logo" width="160" height="160">
  </a>

<h3 align="center">Musicarr</h3>

  <p align="center">
    Musicarr is a YouTube playlists and videos management application. It can download playlists or videos and even monitor new videos in a playlist. 
    <br />
    <a href="https://github.com/SayWess/Musicarr"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <!-- <a href="https://github.com/SayWess/Musicarr">View Demo</a> -->
    <!-- &middot; -->
    <a href="https://github.com/SayWess/Musicarr/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/SayWess/Musicarr/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://github.com/SayWess/Musicarr)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![TypeScript][TypeScript.org]][TypeScript-url]
* [![TailwindCSS][TailwindCSS.com]][TailwindCSS-url]
* [![FastAPI][FastAPI.com]][FastAPI-url]
* [![SQLAlchemy][SQLAlchemy.org]][SQLAlchemy-url]
* [Alembic][Alembic-url]
* [![PostgreSQL][PostgreSQL.org]][PostgreSQL-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* **Docker Compose** : You need docker and docker compose installed on your system to run the application, refer to this link for the installation [Docker][Docker-url]. I find the install using the repo to be the easiest.
* **YouTube Data API key** : You can get your api key here [Console.google.cloud][google-cloud-url]. You must `create a project` and `add YouTube Data API v3` in the APIs your project is using. The go to `credentials or identifiers` and `create an API key`. (optional) Restrict it to Youtube Data API v3. 

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/SayWess/Musicarr.git
   ```
2. Config the environment variables in `docker-compose.yaml`, you can either create a `.env` file with the following variables or just past the values inside the docker-compose file, or any other way you prefer.
   - **DATABASE_URL=postgresql+asyncpg://postgres:`mysecretpassword`@musicarr-postgres:5432/musicarr**
   - **DATABASE_URL_FOR_ALEMBIC=postgresql://postgres:`mysecretpassword`@musicarr-postgres:5432/musicarr**
   - **YOUTUBE_API_KEY=your-api-key** <br/>
  Be sure that `mysecretpassword` matches the password of the db you set in the docker-compose file (**POSTGRES_PASSWORD**).
3. Config your volumes in `docker-compose.yaml`. By default docker creates the volumes so you do not have access to them outside of the container, if you want to access the data you must specify a folder that will be mounted inside the container.
   ```yaml
     musicarr-backend:
      build:
        context: ./backend
        dockerfile: Dockerfile
      volumes:
        - your-absolute-path:/Media
        - metadata_storage:/app/metadata
    ```

    ```yaml
    volumes:
      postgres_data:
      # musicarr_storage:
      metadata_storage:
    ```
4. Build then run the docker compose
   ```bash
   sudo docker compose build
   sudo docker compose up
   ```
5. Go to [localhost:30200](http://localhost:30200)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
# Usage

## Root Folders

![Root Folders][screenshot-root-folders]

**Root Folders** can be found in the ***Settings page***. It will be the folders where your items will be downloaded.

All the downloads will be in the `/Media` folder in the container, you must first add a Root Folder before you can download any item.

You can add a Root Folder by writing its name in the input bar, it will create a folder in `/Media` based on the name you entered, you can also enter folders with subfolders like `Music/my_sub_folder`. Just click the + button to add it.

You can also see and choose a folder that already exists by clicking on **Choose from /Media** and navigate to the folder you want to **select**.

![Select Path for Root Folder ][screenshot-select-path]

Once you added a path (you can add multiple paths), you must select a default path where items will be downloaded by default, if no other Root Folder is assigned to them.

![Set Default Root Folder][screenshot-set-default]


## Manage Playlists

To add a playlist, click on the menu at the bottom of the page and select the `+` button, past the url of the playlist you want to add.then click `Add item`.

![Add Playlist][add-playlist]

You can `sort the playlists` by clicking on the **button next to the one to add a Playlist**




<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap
<!-- 
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
    - [ ] Nested Feature -->

See the [open issues](https://github.com/SayWess/Musicarr/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/SayWess/Musicarr/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SayWess/Musicarr" alt="contrib.rocks image" />
</a>



<!-- LICENSE -->
## License

Distributed under the GNU GENERAL PUBLIC LICENSE. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

<!-- SayWess - [@twitter_handle](https://twitter.com/twitter_handle) - email@email_client.com -->
SayWess - email@email.com


Project Link: [https://github.com/SayWess/Musicarr](https://github.com/SayWess/Musicarr)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/SayWess/Musicarr.svg?style=for-the-badge
[contributors-url]: https://github.com/SayWess/Musicarr/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/SayWess/Musicarr.svg?style=for-the-badge
[forks-url]: https://github.com/SayWess/Musicarr/network/members
[stars-shield]: https://img.shields.io/github/stars/SayWess/Musicarr.svg?style=for-the-badge
[stars-url]: https://github.com/SayWess/Musicarr/stargazers
[issues-shield]: https://img.shields.io/github/issues/SayWess/Musicarr.svg?style=for-the-badge
[issues-url]: https://github.com/SayWess/Musicarr/issues
[license-shield]: https://img.shields.io/github/license/SayWess/Musicarr.svg?style=for-the-badge
[license-url]: https://github.com/SayWess/musicarr/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
[TailwindCSS.com]: https://img.shields.io/badge/Tailwind_CSS-grey?style=for-the-badge&logo=tailwind-css&logoColor=38B2AC
[TailwindCSS-url]: https://tailwindcss.com/
[TypeScript.org]: https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square
[TypeScript-url]: https://www.typescriptlang.org/
[FastAPI.com]: https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi
[FastAPI-url]: https://fastapi.tiangolo.com/
[SQLAlchemy.org]: https://img.shields.io/badge/sqlalchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white
[SQLAlchemy-url]: https://www.sqlalchemy.org/
<!-- [Alembic.org]: https://img.shields.io/badge/sqlalchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white -->
[Alembic-url]: https://alembic.sqlalchemy.org/en/latest/
[PostgreSQL.org]: https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Docker-url]: https://docs.docker.com/engine/install/#supported-platforms
[google-cloud-url]: https://console.cloud.google.com/
[product-screenshot]: images/musicarr_interface.png
[screenshot-root-folders]: images/musicarr_root_folders.png
[screenshot-select-path]: images/musicarr_select_path.png
[screenshot-set-default]: images/musicarr_set_default.png
[add-playlist]: images/musicarr_add_playlist.png
