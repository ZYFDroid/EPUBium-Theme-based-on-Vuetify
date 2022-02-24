<template>
  <div class="coverview">
    <v-container fluid>
      <v-row dense class="d-flex justify-center">
        <v-col v-for="book in books" :key="book.UUID">
          <book-item
            :uuid="book.UUID"
            :name="book.displayName"
          ></book-item> </v-col
      ></v-row>
    </v-container>
  </div>
</template>

<script>
import BookItem from "../components/BookItem.vue";
export default {
  components: { BookItem },
  name: "CoverView",
  props: ["books"],
  mounted() {
    console.log("books");
  },
  methods: {},
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