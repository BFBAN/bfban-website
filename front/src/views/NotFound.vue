<template>
  <div class="container">
    <div class="content notFound" align="center">
      <br>
      <h1>4<b>0</b>4</h1>
      <h4 class="hint">{{ $t("notFound") }}</h4>
      <br>
    </div>
  </div>
</template>

<style>
  .notFound {
    min-height: 500px;
    height: 100%;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    align-content: center;
  }

  .notFound h1 {
    font-size: 15rem;
    color: #8f8f8f;
    margin: 20px 0;
  }
</style>
