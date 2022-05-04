<template>
<div class="controls">
  <button class="button" @click="fontSize -= 1">
    <i class="fas fa-search-minus"></i>
  </button>
  <button class="button" @click="fontSize += 1">
    <i class="fas fa-search-plus"></i>
  </button>
  <div class="dropdown is-right" :class="{ 'is-active': paletteOpen }">
    <div class="dropdown-trigger">
      <button class="button" aria-haspopup="true" aria-controls="dropdown-menu"
              @click="paletteOpen = !paletteOpen">
        <span><i class="fas fa-palette"></i></span>
      </button>
    </div>
    <div class="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a v-for="option in backgroundOptions" :key="option"
            class="dropdown-item"
            :class="{ [option]: true }"
            @click="setBackground(option)">
          {{ makeTitle(stripElement(option == 'default-element' ? 'white-element' : option)) }}
        </a>
      </div>
    </div>
  </div>
  <button class="question-mark button">
    <div class="dropdown is-right" :class="{ 'is-active':  showInfo }">
      <div class="dropdown-trigger">
        <a @click="showInfo ^= true">?</a>
      </div>
      <div class="dropdown-menu">
        <div class="dropdown-content">
          <button class="delete" aria-label="close"
                  @click="showInfo = false">
          </button>
          <p>Pressing <i class="fas fa-search-minus"></i> will decrease the size of the text.</p>
          <p>Pressing <i class="fas fa-search-plus"></i> will incrase the size of the text.</p>
          <p>Pressing <i class="fas fa-palette"></i>
            lets you change backgound colour of the page.</p>
        </div>
      </div>
    </div>
  </button>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      fontSize: 16,
      backgroundOptions: [
        'default-element',
        'green-element',
        'blue-element',
        'red-element',
        'yellow-element',
        'pink-element',
      ],
      paletteOpen: false,
      showInfo: false,
    };
  },
  watch: {
    fontSize(v) {
      const html = document.querySelector('html');
      html.style.fontSize = `${v}pt`;
      this.$store.state.fontSize = v;
    },
  },
  computed: {
    ...mapState({
      currentBackground: state => state.surveyElementClass,
    }),
  },
  methods: {
    setBackground(option) {
      this.$store.state.surveyElementClass = option;
    },
  },
  created() {
    this.fontSize = 16;
  },
};
</script>

<style lang="scss" scoped>
.controls {
  position: absolute;
  top: 0;
  right: 0;

  button {
    font-size: 12pt;
    padding: 8px;
    margin-right: 10px;
    border-radius: 13px;
  }

  .dropdown-menu {
    min-width: 0px;
    padding-right: 10px;
  }

  .question-mark {
    display: inline;
    margin-right: 15px;
    width: 35px;

    a {
      color: #888;
      font-weight: bold;
    }

    .dropdown-menu {
      top: 120%;
      z-index: 10;
    }

    .dropdown-content {
      width: 50vw;
      top: 50px;
      padding: 1rem;
      text-align: left;
      p {
        padding: 5px 0px;
      }
    }

    .delete {
      position: absolute;
      right: 5px;
      top: 7px;
    }
  }
}
</style>
