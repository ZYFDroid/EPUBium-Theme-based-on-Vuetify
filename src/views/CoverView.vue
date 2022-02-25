<template>
  <div class="coverview">
    <v-container fluid>
      <v-row dense class="d-flex justify-center">
        <v-col v-for="book in books" :key="book.UUID">
         <v-card width="140px">
           <v-img
             :src="'/api/cover/'+book.UUID"
             class="white--text align-end"
             gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
             height="200px"
             width="140px"
             @click="readbook(book.UUID)"
           >
             <!-- <v-spacer></v-spacer>{{ name }}<v-spacer></v-spacer> -->
             <v-card-title v-text="name" class="caption "></v-card-title
           ></v-img>
           <v-divider></v-divider>
           <v-card-actions>
             <v-spacer></v-spacer>
             <v-btn text @click="readbook(book.UUID)">阅读</v-btn>
           </v-card-actions>
        </v-card>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  components: {  },
  name: "CoverView",
  props: ["books"],
  mounted() {
    console.log("books");
  },
  methods: {
    readbook(uuid) {
      this.$router.push("/read/" + uuid);
      // alert(uuid)
      // window.location.replace("/api/open/" + uuid)
    }
  },
};
</script>

<style>
.coverview {
  height: 100%;
  overflow: auto;
}
.col {
  flex-grow: 0 !important;
}
</style>