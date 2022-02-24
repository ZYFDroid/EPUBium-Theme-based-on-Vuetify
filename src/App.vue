<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      hide-on-scroll
      v-if="$route.path == '/'"
    >
      <!-- 书架界面 -->
      <div class="d-flex align-center">
        <v-btn icon @click="drawer = true"><v-icon>mdi-menu</v-icon></v-btn>
      </div>
      <div class="text-h6 text-no-wrap" style="overflow: hidden; flex-grow: 1;">&nbsp;{{ menubarTitle }}</div>
      
        <v-text-field
          label=""
          placeholder="搜索书名，作者"
          dense
          hide-details="true"
          v-model="searchKeyword"
          style="min-width:120px; flex-grow: 0;"
        ></v-text-field>
      <v-btn icon @click="doSearch(searchKeyword)"
        ><v-icon>mdi-magnify</v-icon>
        </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      v-if="$route.path == '/'"
    >
      <v-img :aspect-ratio="16 / 7" src="./assets/material.jpg"></v-img>
      <v-list-item>
        <v-list-item-avatar>
          <v-img src="./assets/ic_launcher_round.png"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="text-h6">EPUBium - 书架</v-list-item-title>
          <v-list-item-subtitle> beta1 </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list dense nav>
        <v-subheader>全部</v-subheader>
        <v-list-item link @click="loadAll">
          <v-list-item-icon>
            <v-icon>mdi-book-multiple</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>全部书籍</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
      </v-list>

      <v-list dense nav>
        <v-subheader>文件夹</v-subheader>
        <v-list-item v-if="folders.length == 0">
          <v-alert outlined text border="left" type="warning" elevation="0">
            还没有书籍哟，快去扫描书籍吧！
          </v-alert>
        </v-list-item>
        <div style="height: 60%; overflow: auto">
          <v-list-item link v-for="folder in folders" :key="folder.UUID">
            <v-list-item-icon>
              <v-icon>mdi-folder</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title @click="loadFolder(folder)">{{
                folder.displayName
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>

        <v-divider></v-divider>
        <div class="p2">
          <v-btn disabled text>   </v-btn>
        </div>
      </v-list>

      <div class="pa-2" style="position: fixed; width:100%; bottom: 0px; background-color: #fff;">
        <v-btn :loading="scanning" :disabled="scanning" @click="scanBook" text>
          <v-icon>mdi-feature-search</v-icon>扫描书籍</v-btn
        >
        <!-- <v-btn text> <v-icon>mdi-cog</v-icon>设定</v-btn> -->
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" text>
              <v-icon>mdi-cog</v-icon>设定
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="about = true">
              <v-list-item-title
                ><v-icon>mdi-information</v-icon>关于主题</v-list-item-title
              >
            </v-list-item>
            <v-list-item @click="changeTheme">
              <v-list-item-title
                ><v-icon>mdi-tshirt-v</v-icon>切换主题</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-navigation-drawer>

    <v-main>
      <div :style="autoHeight">
        <router-view :books="books"></router-view>
      </div>
    </v-main>
    <!-- 关于 -->
    <v-snackbar v-model="snackbar">
      {{ text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="red" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <div class="text-center">
      <v-dialog v-model="about" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2"> 主题信息 </v-card-title>

          <v-card-text>
            <div></div>
            <p class="text-h4 text--primary">EPUBium material design 主题包</p>
            <p>
              by SwetyCore
              <a href="https://github.com/SwetyCore" target="_blank">访问他的主页</a>
            </p>
            <div class="text--primary">
              此主题基于 <a href="https://vuetify.cn/zh-Hans/" target="_blank">Vuetify</a>制作。
              主题仓库地址 ：<a
                href="https://github.com/SwetyCore/EPUBium-Theme-based-on-Vuetify" target="_blank"
                >SwetyCore/EPUBium-Theme-based-on-Vuetify</a
              >
              喜欢就点个 Star 吧！
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="about = false"> 关闭 </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  name: "App",

  components: {},

  data: () => ({
    scanning: false,
    drawer: false,
    username: "Swety",
    searchKeyword: "",
    snackbar: false,
    text: "",
    autoHeight: {},
    folders: [],
    books: [],
    menubarTitle: "",
    about: false,
  }),
  mounted() {
    axios
      .get("/api/devname")
      .then((res) => {
        console.log(res.data);
        this.username = res.data;
        this.menubarTitle = this.username + "的书";
      })
      .catch((err) => {
        this.toast(err);
      });
    this.getHeight();
    this.loadAll();
    this.getfolders();
  },
  created() {
    window.addEventListener("resize", this.getHeight);
    this.getHeight();
  },
  destroyed() {
    window.removeEventListener("resize", this.getHeight);
  },
  methods: {
    getHeight() {
      this.autoHeight = {
        height:
          document.body.clientHeight - this.$vuetify.application.top + "px",
      };
    },
    changeTheme() {
      axios.get("/api/respack").then().catch();
    },
    getfolders() {
      //[{"id":-1,"UUID":"c7e82e3a1ceca76898c7aae3ca595c48","type":1,"parentUUID":"","displayName":"新建文件夹","path":".\\新建文件夹","lastOpenTime":1645524082447}]
      axios
        .get("/api/folders")
        .then((res) => {
          this.folders = res.data;
          this.drawer = false;
        })
        .catch((err) => {
          this.toast(err);
        });
    },
    loadAll() {
      //[{"id":-1,"UUID":"bf9d17fd4a896ae3b2c6bfbb77fa12ab","type":0,"parentUUID":"c7e82e3a1ceca76898c7aae3ca595c48","displayName":"约会大作战 赤黑新章 1 - 东出佑一郎","path":".\\新建文件夹\\[东出佑一郎].约会大作战.赤黑新章.1.epub","lastOpenTime":1645528382758},{"id":-1,"UUID":"96e5f0de872750c72f073ee28a63e17a","type":0,"parentUUID":"54559737cfc31149e1fbea379cee0403","displayName":"约会大作战 赤黑新章 1 - 东出佑一郎","path":".\\新建文件夹 - 副本\\[东出佑一郎].约会大作战.赤黑新章.1.epub","lastOpenTime":1645520768895}]
      axios
        .get("/api/library")
        .then((res) => {
          this.books = res.data;
          this.drawer = false;
        })
        .catch((err) => {
          this.toast(err);
        });

      this.menubarTitle = this.username + "的书";
    },
    loadFolder(folder) {
      axios
        .get("/api/folder/" + folder.UUID)
        .then((res) => {
          this.books = res.data;
          this.drawer = false;
        })
        .catch((err) => {
          this.toast(err);
        });
      this.menubarTitle = folder.displayName + "里的书";
    },
    scanBook() {
      this.scanning = true;
      axios
        .get("/api/scan")
        .then((res) => {
          this.toast(res.data);
          this.scanning = false;
        })
        .catch((err) => {
          this.toast(err);
          this.scanning = false;
        });
      this.loadAll();
      this.getfolders();
    },
    doSearch(keyword) {
      axios
        .get("/api/library")
        .then((res) => {
          var preresult = res.data;
          var books = [];
          for (let i = 0; i < preresult.length; i++) {
            const entry = preresult[i];
            if (entry.displayName.indexOf(keyword) != -1) {
              books.push(entry);
              // console.log(entry);
            }
          }
          this.drawer = false;
          this.books = books;
          this.menubarTitle = "搜索结果";
        })
        .catch((err) => {
          this.toast(err);
        });
    },
    toast(msg) {
      this.snackbar = true;
      this.text = msg;
    },
  },
};
</script>
<style>
html {
  overflow: hidden !important;
}
body {
  height: 100vh;
}
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: #90909060;
}
::-webkit-scrollbar-track {
  border-radius: 5px;
  background: #60606020;
}
aside {
  height: 100vh !important;
}
</style>