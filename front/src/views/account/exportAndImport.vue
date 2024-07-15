<template>
  <div class="profile-body">
    <p>{{ $t('profile.exportAndImport.description') }}</p>
    <br>
    <p class="hint">{{ $t('profile.exportAndImport.hint1') }}</p>
    <p class="hint">{{ $t('profile.exportAndImport.hint2') }}</p>
    <br>

    <Tabs value="export">
      <TabPane label="Export" name="export">
        <Row :gutter="10">
          <Col>
            Preset scheme:
          </Col>
          <Col>
            <Select v-model="patternTypeValue" @on-change="onChangePatternType">
              <Option v-for="(i,index) in patternType" :key="index" :value="i">{{ i }}</Option>
            </Select>
          </Col>
        </Row>
        <br>

        <template v-if="storageKeys.length > 0">
          <div>
            <CheckboxGroup v-model="selectGroup" class="export-box" :disabled="selectGroup <= 0">
              <Card class="export-card" dis-hover v-for="(i, index) in storageKeys" :key="index">
                <Row>
                  <Col flex="1" class="export-card-name">
                    <Checkbox :label="i.name">{{ i.name }}</Checkbox>
                  </Col>
                </Row>
              </Card>
            </CheckboxGroup>
          </div>

          <Divider dashed></Divider>

          <Button long @click="onExport" :loading="generatedZipLoad" :disabled="selectGroup.length <= 0">
            Export ({{ selectGroup.length || 0 }})
          </Button>
        </template>
        <Card dis-hover v-else>
          <Empty></Empty>
        </Card>
      </TabPane>
      <TabPane label="Import" name="import">
        <Card dis-hover :padding="2" class="ivu-upload-select">
          <input type="file" id="file" name="file" class="ivu-upload-input" multiple
                 @change="onImportPreparation"/><br/>
        </Card>
        <p><br></p>

        <template v-if="importPreparation.length > 0">
          <CheckboxGroup v-model="selectImportPreparationGroup" class="export-box">
            <Card class="export-card" dis-hover v-for="(i, index) in importPreparation" :key="index">
              <Checkbox :label="i.name">{{ i.name }}</Checkbox>
              <p><br></p>
              <Row :gutter="5">
                <Col flex="1">
                  <Select v-model="i.operationTypeValue" size="small">
                    <Option v-for="(j, jindex) in operationType" :key="jindex" :value="j">
                      {{ j }}
                    </Option>
                  </Select>
                </Col>
                <Col>
                  <span v-if="i.isExists" style="color: red">
                    <Icon type="md-alert"/>Exists
                  </span>
                </Col>
              </Row>
            </Card>
          </CheckboxGroup>
        </template>
        <Card dis-hover v-else>
          <Empty></Empty>
        </Card>

        <Divider dashed></Divider>

        <Button long :disabled="selectImportPreparationGroup.length <= 0" @click="onImport">Import</Button>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import {storage} from "@/assets/js";
import HtmlWidget from "@/components/HtmlWidget";
import Empty from "@/components/Empty";
import Application from "@/assets/js/application";
import JSZip from "jszip";
import saveAs from "@/assets/js/FileSaver";
import config from "../../../package.json"

export default new Application({
  name: "exportAndImport",
  data() {
    return {
      generatedZipLoad: false,
      selectGroup: [],
      storageKeys: [],
      primitiveStorageKeys: [],
      operationType: ["cover", "inherit"],
      patternType: ["user", "system"],
      patternTypeValue: "",
      selectImportPreparationGroup: [],
      importPreparation: [],
    }
  },
  components: {HtmlWidget, Empty},
  created() {
    this.getLocaleAppKeys()

    if (!JSZip.support.blob) {
      this.$Message.error('This demo works only with a recent browser !')
    }
  },
  methods: {
    onChangePatternType(value) {
      const app_name = config.name.toLowerCase();
      switch (value) {
        case "user":
          this.selectGroup = [
            app_name + '.development:user.player',
            app_name + '.development:user.configuration',
            app_name + '.development:user.subscribes',
            app_name + '.development:search.history',
            app_name + '.development:customReply',
            app_name + '.development:viewed',
          ]
          break
        case "system":
          this.selectGroup = [
            app_name + '.development:language',
            app_name + '.development:theme',
          ]
          break
        default:
          this.selectGroup = []
          break
      }
    },
    getLocaleAppKeys() {
      const keys = storage.local.keys();
      const list = []
      this.primitiveStorageKeys = keys;
      for (const key in keys) {
        let i = keys[key];
        const split = key.split(":");
        const q = split[0];
        const h = split[1];
        if (!q || !h) continue
        if (key.indexOf(storage.STORAGENAME) >= 0) {
          i = Object.assign(JSON.parse(i), {
            name: key
          })
          list.push(i)
        }
      }
      this.storageKeys = list
    },
    /**
     * 导出
     */
    onExport() {
      try {

        if (!this.isLogin || this.selectGroup.length <= 0) return
        const that = this;
        const zip = new JSZip();

        let dictionary = {}
        for (const storageKey of this.storageKeys) {
          /**
           * exp:
           * {
           *   name: '',
           *   path: ''
           * }
           */
          if (this.selectGroup.indexOf(storageKey.name) >= 0)
            dictionary[storageKey.name] = {
              size: storageKey.value.length ?? 0,
              name: storageKey.name,
              path: 'data/' + storageKey.name + '.json'
            }
        }

        zip.file("dictionary.json", JSON.stringify(dictionary));
        zip.folder("data");

        for (const storageKey of this.storageKeys) {
          if (this.selectGroup.indexOf(storageKey.name) >= 0)
            zip.file("data/" + storageKey.name + '.json', JSON.stringify(storageKey.value))
        }

        that.generatedZipLoad = true;
        zip.generateAsync({type: "blob"}).then(function (content) {
          that.generatedZipLoad = false;
          saveAs(content, `${that.currentUser.userinfo.userId}@${new URL(location).hostname}.zip`);
        });

        this.selectGroup = [];
      } catch (err) {
        this.$Message.error(err)
      }
    },
    /**
     * 导入准备
     * 校验是否合规压缩
     */
    onImportPreparation(event) {
      const files = event.target.files;
      const that = this;
      this.importPreparation = [];
      this.selectImportPreparationGroup = [];

      for (var i = 0; i < files.length; i++) {
        JSZip.loadAsync(files[i])                                   // 1) read the Blob
            .then(function (zip) {
              let _zip = zip;

              if (!_zip.files['dictionary.json']) {
                that.$Message.error("This is not the intended package, please check if it is exported from the website\n")
              }

              _zip.folder("data").forEach(function (relativePath, zipEntry) {
                zip.file(zipEntry.name).async('text').then(data => {
                  const name = relativePath.split(':')[1].replaceAll('.json', '');
                  const isExists = storage.local.get(name).code === 0;

                  that.importPreparation.push({
                    name: relativePath.replaceAll('.json', ''),
                    value: data,
                    isExists,
                    operationTypeValue: that.operationType[0]
                  })
                })
              });
            }, function (err) {
              that.importPreparation = [];
              that.selectImportPreparationGroup = [];

              that.$Message.error(err)
            });
      }

    },
    /**
     * 导入
     */
    onImport() {
      try {
        if (!this.isLogin) return

        this.importPreparation.forEach(async i => {
          let data, checkData, localData;

          if (this.selectImportPreparationGroup.indexOf(i.name) >= 0) {
            switch (i.operationTypeValue) {
              case "cover":
                data = JSON.parse(i.value);
                break;
              case "inherit":
                localData = await storage.local.get(i.name.split(':')[1])?.data.value;
                checkData = JSON.parse(i.value);

                if (checkData.constructor === Array) {
                  data = localData.concat(checkData)
                } else if (checkData.constructor === Object) {
                  data = Object.assign(localData, checkData)
                } else {
                  this.$Message.error('Supported type. Change the mode\n')
                  return
                }
                break;
              default:
                break;
            }
          }

          storage.local.set(i.name.split(':')[1], data)
        })

        this.$Message.success('ok');
      } catch (err) {
        this.$Message.error(err);
      }
    }
  }
})
</script>

<style lang="less" scoped>
.export-box {
  width: 100%;
  display: inline-grid;
  grid-template-columns: repeat(auto-fill, calc(50% - 10px));
  grid-row-gap: 10px;
  grid-column-gap: 10px;

  .export-card {
    .export-card-name {
      word-break: break-word;
      text-wrap: normal;
    }
  }
}
</style>
