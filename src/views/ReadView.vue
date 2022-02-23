

<template>
  <div>
    <!-- 顶栏 -->
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-btn icon @click="drawer = true"><v-icon>mdi-menu</v-icon></v-btn>
      </div>
      <v-col :cols="2">
        <div class="text-h5 text-no-wrap">&nbsp;{{ BookTitle }}</div>
        <div class="text-subtitle-2">
          &nbsp;{{ "[" + locationPage + "]" + locationChapter }}
        </div>
      </v-col>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleBookmark()"
        ><v-icon v-if="!bookmark">mdi-bookmark-outline</v-icon>
        <v-icon v-else>mdi-bookmark</v-icon></v-btn
      >
      <!-- 阅读菜单 -->
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark v-bind="attrs" v-on="on" icon>
            <v-icon>mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in menuItems"
            :key="index"
            @click="item.method"
          >
            <!-- <v-list-item-icon
              ><v-icon>{{ item.icon }}</v-icon></v-list-item-icon
            > -->
            <v-list-item-title
              ><v-icon>{{ item.icon }}</v-icon
              >{{ item.title }}</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <!-- 侧边栏 -->
    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-tabs fixed-tabs icons-and-text>
        <v-tab> 目录 <v-icon>mdi-locker-multiple</v-icon> </v-tab>
        <v-tab> 存档 <v-icon>mdi-book-multiple</v-icon></v-tab>
        <v-tab-item :style="autoHeight">
          <v-list dense nav>
            <div style="margin-bottom: 60px">
              <v-list-item link v-for="chapter in chapters" :key="chapter">
                <!-- <v-list-item-icon>
                  <v-icon>mdi-folder</v-icon>
                </v-list-item-icon> -->

                <v-list-item-content>
                  <v-list-item-title @click="chapterClick(chapter)"
                    ><v-icon>mdi-folder</v-icon>
                    {{ chapter.label.trim() }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </div>

            <v-divider></v-divider>
          </v-list>
        </v-tab-item>
        <!-- 存档 -->
        <v-tab-item>
          <div style="margin-bottom: 60px" :style="autoHeight">
            <v-container v-for="save in saves" :key="save.saveTime">
              <v-card mx-auto elevation="1">
                <v-card-title>
                  {{ save.name }}
                </v-card-title>
                <v-card-subtitle>
                  {{ timeformat(save.saveTime) }}
                </v-card-subtitle>
                <v-divider></v-divider>
                <v-card-actions
                  ><v-chip class="ma-2" color="primary">
                    {{ saveType(save.slot) }}</v-chip
                  >
                  <v-spacer></v-spacer>
                  <v-btn color="pink" small text @click="saveClick(save)"
                    >保存</v-btn
                  >
                  <v-btn color="pink" small text @click="loadClick(save)"
                    >读取</v-btn
                  ></v-card-actions
                >
              </v-card>
            </v-container>
          </div>
        </v-tab-item>
      </v-tabs>
    </v-navigation-drawer>
    <!-- 读书
    {{ uuid }} -->
    <v-progress-linear
      indeterminate
      color="cyan"
      v-show="progressbar"
    ></v-progress-linear>
    <iframe
      src=""
      class="mainframe"
      width="100%"
      height="800px"
      frameborder="0"
      id="bookframe"
      :style="autoHeight"
    ></iframe>
    <v-snackbar v-model="snackbar">
      {{ text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="red" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <!-- 字体大小对话框 -->
    <v-row justify="center">
      <v-dialog v-model="dialogFontsize" scrollable max-width="300px">
        <v-card>
          <v-card-title>字体大小选择</v-card-title>
          <v-divider></v-divider>
          <v-card-text style="height: 300px">
            <v-radio-group v-model="Fontsize" column>
              <v-radio label="100%" value="15"></v-radio>
              <v-radio label="125%" value="19"></v-radio>
              <v-radio label="150%" value="22.5"></v-radio>
              <v-radio label="175%" value="26"></v-radio>
              <v-radio label="200%" value="30"></v-radio>
            </v-radio-group>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="blue darken-1" text @click="dialogFontsize = false"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
/* eslint-disable */
function dateFormat(fmt, date) {
  let ret;
  const opt = {
    "y+": date.getFullYear().toString(), // 年
    "M+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "m+": date.getMinutes().toString(), // 分
    "s+": date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
}
window.reportMessage = function reportMessage(type, content) {
  //console.warn("<"+type+"::"+content);
  messageInteract[type](content);
};
var subdoc = null;
var messageInteract = {};
var autoSaveCountdown = 30;

var lockedBookmark = false;
var lockedBookmarkCfi = "";

var autoSaver = null;
import axios from "axios";
export default {
  name: "ReadView",
  props: ["uuid"],
  data() {
    return {
      snackbar: false,
      text: "",
      autoHeight: {},
      BookTitle: "约会大作战 赤黑新章 1 - 东出佑一郎",
      drawer: false,
      progressbar: false,
      // subtitle: "[1/3]",
      locationPage: "1/1",
      locationChapter: "",
      currentPositoin: "",
      bookmark: false,
      dialogFontsize: false,
      Fontsize: 15,
      chapters: [],
      saves: [
        {
          id: 3,
          bookid: "96e5f0de872750c72f073ee28a63e17a",
          slot: 0,
          epubcft: "epubcfi(/6/6[message.xhtml]!/4/2/2/1:0)",
          name: "1/2\n制作信息",
          saveTime: 1645595035253,
        },
        {
          id: 45,
          bookid: "96e5f0de872750c72f073ee28a63e17a",
          slot: 0,
          epubcft: "epubcfi(/6/6[message.xhtml]!/4/2/2/1:0)",
          name: "1/2\n制作信息",
          saveTime: 1645595035253,
        },
      ],
      menuItems: [
        {
          title: "字体大小",
          icon: "mdi-format-size",
          method: this.setfontsize,
        },
        {
          title: "快速存档",
          icon: "mdi-file",
          method: this.mnuQS,
        },
        {
          title: "快速读档",
          icon: "mdi-page-next-outline",
          method: this.mnuQL,
        },
        {
          title: "返回主页",
          icon: "mdi-home",
          method: this.gohome,
        },
      ],
    };
  },
  mounted() {
    this.getHeight;
    this.initInteract();
    this.loadAllBookmark();
    var fontsize = parseInt(localStorage.getItem("fontsize"));
    if ([15, 19, 22.5, 26, 30].indexOf(fontsize) != -1) {
      this.Fontsize = fontsize;
    }

    subdoc = document.getElementById("bookframe").contentWindow;
    subdoc.location.replace("/read/" + this.uuid + "/static/index.html");

    // this.loadChapterInfo();
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
          document.body.clientHeight - this.$vuetify.application.top-72 + "px",
        overflow: "auto",
      };
    },
    saveClick: function (save) {
      // $.ajax(
      //   "api/bmsave/" +
      //     save.slot +
      //     "?name=" +
      //     encodeURI(locationPage + "\n" + locationChapter) +
      //     "&cfi=" +
      //     encodeURI(currentPositoin),
      //   {
      //     success: function () {
      //       loadAllBookmark();
      //       toast("存档已保存");
      //     },
      //     error: function () {
      //       toast("存档失败");
      //     },
      //   }
      // );
      var args = {
        name: this.locationPage + "\n" + this.locationChapter,
        cfi: this.currentPositoin,
      };
      axios
        .get("read/" + this.uuid + "/api/bmsave/" + save.slot, {
          params: args,
        })
        .then((res) => {
          this.loadAllBookmark();
        })
        .catch((err) => {});
    },
    loadClick: function (save) {
      subdoc.navTo(save.epubcft);
      this.drawer = false;
    },
    setfontsize() {
      this.dialogFontsize = true;
    },
    chapterClick: function (chapter) {
      subdoc.navTo(chapter.href);
      this.drawer = false;
    },
    initInteract() {
      var _this = this;
      messageInteract["EPUB_BOOK_INIT_START"] = function (arg) {
        // $.ajax({
        //   url: "api/bmload/0",
        //   success: function (result) {
        //     var bookmark = JSON.parse(result);
        //     subdoc.loadBookAtUrl("", bookmark.epubcft, fontsize);
        //   },
        // });
        axios.get("read/" + _this.uuid + "/api/bmload/0").then((res) => {
          _this.subtitle = res.data.name;
          var bookmark = res.data;
          subdoc.loadBookAtUrl("", bookmark.epubcft, _this.Fontsize);
        });

        // $.ajax({
        //   url: "api/bookname",
        //   success: function (result) {
        //     $("#title1").text(result);
        //     document.title = result;
        //   },
        // });
        axios.get("read/" + _this.uuid + "/api/bookname").then((res) => {
          _this.BookTitle = res.data;
        });
      };
      messageInteract["EPUB_BOOK_INIT_SUCCESS"] = function (arg) {
        subdoc.reportBookInfo();
      };
      messageInteract["EPUBTOC"] = function (arg) {
        var tocs1 = JSON.parse(arg);
        var toc2 = [];
        var stack = 0;
        var tocproc = function (target, parent) {
          parent.stack = stack;
          target.push(parent);
          var subtoc = parent.subitems;

          for (let i = 0; i < subtoc.length; i++) {
            stack++;
            tocproc(target, subtoc[i]);
            stack--;
          }
        };
        for (let i = 0; i < tocs1.length; i++) {
          tocproc(toc2, tocs1[i]);
        }
        _this.chapters = toc2;
      };
      messageInteract["EPUBSPINE"] = function (arg) {};
      messageInteract["REPORT_LOCATION"] = function (arg) {
        _this.locationPage = arg;
        // showReadingProgress();
      };
      messageInteract["REPORT_CHAPTER"] = function (arg) {
        if (arg != null && arg != "") {
          _this.locationChapter = arg;
          // showReadingProgress();
        }
      };
      messageInteract["SHOW_PROGRESS"] = function (arg) {
        if (arg == "1") {
          _this.progressbar = true;
          // $(".progressbar").show();
        } else {
          _this.progressbar = false;

          // $(".progressbar").hide();
        }
      };
      messageInteract["AUTO_SAVE_REQUIRE"] = function (arg) {
        _this.currentPositoin = arg;
        autoSaveCountdown = -1;
        if (autoSaver == null) {
          autoSaver = setInterval(_this.autoSaveFunc, 100);
        }
      };
      messageInteract["GET_SAVING"] = function (arg) {
        _this.currentPositoin = arg;
        autoSaveCountdown = 30;
        if (autoSaver == null) {
          autoSaver = setInterval(_this.autoSaveFunc, 100);
        }
      };
    },
    loadAllBookmark() {
      axios
        .get("read/" + this.uuid + "/api/bmloadall")
        .then((res) => {
          this.saves = res.data;
        })
        .catch((err) => {});
    },
    gohome() {
      this.$router.push("/");
    },
    autoSaveFunc() {
      if (autoSaveCountdown > 0) {
        autoSaveCountdown--;
      } else {
        // $.ajax(
        //   "api/bmsave/" +
        //     0 +
        //     "?name=" +
        //     encodeURI(locationPage + "\n" + locationChapter) +
        //     "&cfi=" +
        //     encodeURI(currentPositoin),
        //   {
        //     success: function () {
        //       loadAllBookmark();
        //     },
        //     error: function () {
        //       toast("自动存档失败");
        //     },
        //   }
        // );
        var args = {
          name: this.locationPage + "\n" + this.locationChapter,
          cfi: this.currentPositoin,
        };
        axios
          .get("read/" + this.uuid + "/api/bmsave/0", {
            params: args,
          })
          .then((res) => {
            this.loadAllBookmark();
          })
          .catch((err) => {
            this.toast("自动存档失败!");
          });
        clearInterval(autoSaver);
        autoSaver = null;
      }
    },
    mnuQS() {
      // toast("正在存档");
      // $.ajax(
      //   "api/bmsave/" +
      //     1 +
      //     "?name=" +
      //     encodeURI(locationPage + "\n" + locationChapter) +
      //     "&cfi=" +
      //     encodeURI(currentPositoin),
      //   {
      //     success: function () {
      //       loadAllBookmark();
      //       toast("存档已保存");
      //     },
      //     error: function () {
      //       toast("存档失败");
      //     },
      //   }
      // );
      var args = {
        name: this.locationPage + "\n" + this.locationChapter,
        cfi: this.currentPositoin,
      };
      axios
        .get("read/" + this.uuid + "/api/bmsave/1", {
          params: args,
        })
        .then((res) => {
          this.loadAllBookmark();
          this.toast("存档已保存");
        })
        .catch((err) => {
          this.toast("存档保存失败");
        });
    },
    mnuQL() {
      // toast("正在读档");
      // $.ajax({
      //   url: "api/bmload/1",
      //   success: function (result) {
      //     var bookmark = JSON.parse(result);
      //     subdoc.navTo(bookmark.epubcft);
      //     toast("存档已读取");
      //   },
      //   error: function () {
      //     toast("读取失败");
      //   },
      // });
      var args = {
        name: this.locationPage + "\n" + this.locationChapter,
        cfi: this.currentPositoin,
      };
      axios
        .get("read/" + this.uuid + "/api/bmload/1")
        .then((res) => {
          var bookmark = res.data;
          subdoc.navTo(bookmark.epubcft);
          this.toast("存档已读取");
        })
        .catch((err) => {
          this.toast(读取失败 + err);
        });
    },
    toast(msg) {
      this.snackbar = true;
      this.text = msg;
    },
    toggleBookmark() {
      if (!lockedBookmark) {
        lockedBookmark = true;
        lockedBookmarkCfi = this.currentPositoin;
        this.bookmark = true;
      } else {
        lockedBookmark = false;
        subdoc.navTo(lockedBookmarkCfi);
        this.bookmark = false;
      }
    },
  },
  computed: {
    timeformat() {
      return function (tm) {
        var date = new Date();
        date.setTime(tm);
        return dateFormat("yyyy-MM-dd HH:mm:ss", date);
      };
    },
    saveType() {
      return function (slot) {
        var type = "存档 #" + (slot - 1);
        if (slot == 0) {
          type = "自动存档";
        }
        if (slot == 1) {
          type = "快速存档";
        }
        return type;
      };
    },
  },
  watch: {
    Fontsize(a, b) {
      localStorage.setItem("fontsize", a);
      try {
        subdoc.setTextSize(a);
      } catch {}
    },
  },
};
</script>

<style>
</style>