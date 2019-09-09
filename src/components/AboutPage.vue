<template>
  <div>
    <update-message />
    <p>如果喜欢，<a href="https://chrome.google.com/webstore/detail/kmgdfejkkpmeimbkglbjmgbfiggimfhp" target="_blank">请给这个扩展程序一个好评(墙外)：</a><br />
      <a href="https://chrome.google.com/webstore/detail/kmgdfejkkpmeimbkglbjmgbfiggimfhp"
         target="_blank" class="rate-link">
        <a-rate :defaultValue="5" disabled />
      </a>
    </p>
    <p>
      项目已开源，欢迎贡献代码！<br />
      如遇到任何问题，可以通过邮件或Github Issue的方式告知我，<br />
      非常感谢。
    </p>
    <p><a href="https://chrome.google.com/webstore/detail/kmgdfejkkpmeimbkglbjmgbfiggimfhp" target="_blank">
      <img alt="Chrome Web Store"
           src="https://img.shields.io/chrome-web-store/v/kmgdfejkkpmeimbkglbjmgbfiggimfhp.svg?style=flat-square" />
    </a></p>
    <p>
      <!--suppress HtmlDeprecatedAttribute -->
      <iframe src="https://ghbtns.com/github-btn.html?user=ZKLlab&repo=SHU-scheduling-helper&type=star&count=true"
              frameborder="0" scrolling="0" width="100px" height="20px"></iframe>
      <!--suppress HtmlDeprecatedAttribute -->
      <iframe src="https://ghbtns.com/github-btn.html?user=ZKLlab&repo=SHU-scheduling-helper&type=fork&count=true"
              frameborder="0" scrolling="0" width="100px" height="20px"></iframe>
    </p>
    <p>
      <a-icon type="github" />
      Github: <a href="https://github.com/ZKLlab/SHU-scheduling-helper" target="_blank">ZKLlab/SHU-scheduling-helper</a><br />
      <a-icon type="team" />
      Contributor(s): [ <a href="https://github.com/ZKLlab" target="_blank">ZKL</a> ]<br />
      <a-icon type="mail" />
      Email: <a :href="mailto">{{ email }}</a><br />
      <a-icon type="environment" />
      Location: SHUCES, Shanghai, China
    </p>
  </div>
</template>

<script>
  import UpdateMessage from './UpdateMessage'

  export default {
    name: 'AboutPage',
    components: {UpdateMessage},
    computed: {
      email() {
        return atob('emtsQHprbGxhYi5jb20=');
      },
      mailto() {
        return `mailto:${this.email}`
      },
    },
  };
</script>

<style scoped>
  /*noinspection CssUnusedSymbol*/
  .rate-link >>> .ant-rate-star {
    cursor: pointer !important;
  }
</style>