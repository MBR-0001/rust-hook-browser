<template>
  <div id="app">
    <div style="width: 100%; padding: 0 5px;">
      <h1 style="text-align: center;">Rust Hook Browsert</h1>
      <div class="flexer" style="margin: 5px 0;">
        <b-form-input v-model="search" placeholder="Search"></b-form-input>
        <b-pagination v-model="page" :total-rows="raw_hooks.length" :per-page="50" style="margin-bottom: 0;"></b-pagination>
      </div>
      <b-table responsive hover striped :fields="fields" :items="hooks" :busy="raw_hooks.length < 1" :per-page="50" :current-page="page" @row-clicked="rowClicked">
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>

        <template #cell(description)="data">
          {{data.item.description[0]}}
        </template>
      </b-table>
    </div>

    <b-modal id="hook_modal" :title='"Info about " + hook.name' hide-footer centered size="lg" body-class="modal-overflow">
      <table class="table">
        <tr>
          <td>Name</td>
          <td>{{hook.name}}</td>
        </tr>
        <tr>
          <td>Category</td>
          <td>{{hook.category + "/" + hook.subcategory}}</td>
        </tr>
        <tr>
          <td>Created At</td>
          <td style="vertical-align: middle;">{{properDate(hook.created_at, true)}}</td>
        </tr>
        <tr>
          <td>Description</td>
          <td>
            <ul style="margin: 0; padding-left: 20px;">
              <li v-for="(line, i) in hook.description" :key="i">{{line}}</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>Example</td>
          <td v-html="md.render(hook.example)" class="example">
          </td>
        </tr>
      </table>
    </b-modal>
  </div>
</template>

<script>
import Vue from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "highlight.js/styles/default.css";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

export default {
  name: "App",
  data: function () {
    return {
      url: "https://api.mbr.pw/api/rust/hooks",
      raw_hooks: [],
      page: 1,
      search: "",
      md: new MarkdownIt({
        highlight: (str, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str)?.value;
            } catch (_) { /**/ }
          }
        }
      }),
      hook: {_description: "", example: ""},
      fields: [
        {
          key: "name",
          label: "Name",
          sortable: true
        },
        {
          key: "category",
          label: "Category",
          sortable: true
        },
        {
          key: "subcategory",
          label: "Subcategory",
          sortable: true
        },
        {
          key: "description",
          label: "Description"
        }
      ]
    };
  },
  computed: {
    hooks: function() {
      let rv = this.raw_hooks;
      
      if (this.search) {
        let q = this.search.toLowerCase();
        rv = rv.filter(x => x.name.toLowerCase().includes(q) || x.description.some(d => d.toLowerCase().includes(q)));
      }

      return rv;
    }
  },
  methods: {
    rowClicked: function(hook) {
      this.hook = hook;
      this.$bvModal.show("hook_modal");
    },
    properDate: function(date, hover = false) {
      if (!date) return "";

      if (typeof(date) == "string") date = new Date(date);

      if (hover) return date.toUTCString().replace("GMT", "UTC");
      return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate() + " " + this.normalize(date.getUTCHours()) + ":" + this.normalize(date.getUTCMinutes()); 
    }
  },
  mounted: function() {
    fetch(this.url).then(r => r.json()).then(x => this.raw_hooks = x);
  }
};
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.flexer {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.example { padding-bottom: 0!important; }
.example > pre { margin: 0; }
.modal-overflow { overflow: auto; }
</style>
