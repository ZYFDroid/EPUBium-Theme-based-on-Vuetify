<template>
  <v-card width="140px">
    <v-img
      :src="'/api/cover/'+uuid"
      class="white--text align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      height="200px"
      width="140px"
      @click="readbook(uuid)"
    >
      <!-- <v-spacer></v-spacer>{{ name }}<v-spacer></v-spacer> -->
      <v-card-title v-text="name" class="caption "></v-card-title
    ></v-img>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="readbook(uuid)">阅读</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "BookItem",
  props: ["uuid", "name"],
  
  methods: {
    readbook(uuid) {
      this.$router.push("/read/" + uuid);
      // alert(uuid)
      // window.location.replace("/api/open/" + uuid)
    },
  },
};
</script>

<style>
</style>