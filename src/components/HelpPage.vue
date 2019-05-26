<template>
  <div>
    <p>Hi!<br />欢迎使用上海大学排课助手
      <small>(插件版)</small>
      。
    </p>
    <p>此教程将帮助你认识助手的几项基本用法，以下功能请自己探索哦：</p>
    <ul>
      <li>导出课程列表</li>
      <li>查看时间冲突</li>
      <li>学期管理</li>
      <li>……</li>
    </ul>
    <a-divider></a-divider>
    <h4>课程查询 添加待选课程</h4>
    <p>
      打开<a href="http://www.xk.shu.edu.cn/" target="_blank">http://www.xk.shu.edu.cn/</a>
      （也可以点击主界面的 <a href="http://www.xk.shu.edu.cn/" target="_blank">去选课网站
      <a-icon type="right" />
    </a> ），<br />进入对应学期的选课系统【不要进错学期】，<br />选择 <strong>课程查询</strong> 检索要添加的课程。
    </p>
    <p>
      此时检索结果表格右侧会添加一列按钮，<br />点击 <strong>+ 待选</strong> 即可将课程添加到待选课程列表列表，<br />这个页面会实时展现你的待选课程。
    </p>
    <p>
      <img src="https://xk.zkllab.com/help-1.jpg" alt="课程查询" />
    </p>
    <a-divider></a-divider>
    <h4>选课 快捷选课列表</h4>
    <p>
      打开<a href="http://www.xk.shu.edu.cn/" target="_blank">http://www.xk.shu.edu.cn/</a>
      （也可以点击主界面的 <a href="http://www.xk.shu.edu.cn/" target="_blank">去选课网站
      <a-icon type="right" />
    </a> ），<br />进入对应学期的选课系统【不要进错学期】，<br />选择 <strong>选课</strong>。
    </p>
    <p>
      此时页面右侧会出现你在这个页面选择的课程，<br />与排课助手课程表中的课程一致，<br />你可以对照快捷选课列表进行选课。
    </p>
    <p>
      <img src="https://xk.zkllab.com/help-2.jpg" alt="快捷录入" />
    </p>
  </div>
</template>

<script>
  export default {
    name: 'HelpPage'
  }
</script>

<style scoped>
  img {
    width: 100%;
  }
</style>