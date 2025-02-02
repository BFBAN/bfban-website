<template>
  <div class="profile-body">
    <Row :gutter="10" type="flex" align="middle">
      <Col>
        <Button long @click="onExport" :loading="generatedZipLoad" :disabled="selectGroup.length <= 0">
          Export ({{ selectGroup.length || 0 }})
        </Button>
      </Col>
      <Col>
        <Button @click="importModel = !importModel">
          <Icon type="md-add"></Icon>
          Import
        </Button>
      </Col>
      <Divider type="vertical"></Divider>
      <Col>
        <Select v-model="patternTypeValue" @on-change="onChangePatternType">
          <Option v-for="(i,index) in patternType" :key="index" :value="i">{{ i }}</Option>
        </Select>
      </Col>
      <Col>
        <a href="https://announcement.bfban.com/docs/exportAndImport" target="_blank">
          <Icon type="md-help"></Icon>
        </a>
      </Col>
      <Col flex="1"></Col>
      <Col>
        <Input></Input>
      </Col>
    </Row>
    <br>

    <template v-if="storageKeys.length > 0">
      <CheckboxGroup v-model="selectGroup" class="export-box" :disabled="selectGroup <= 0">
        <List border>
          <ListItem class="export-card" dis-hover v-for="(i, index) in storageKeys" :key="index">
            <Row :gutter="0">
              <Col>
                <Checkbox :label="i.value" :disabled="!i.data"></Checkbox>
              </Col>
            </Row>
          </ListItem>
        </List>
      </CheckboxGroup>
    </template>
    <Card dis-hover v-else>
      <Empty :not-hint="true"></Empty>
    </Card>

    <br>
    <p class="hint hint-seriousness">{{ $t('profile.exportAndImport.description') }}</p>
    <p class="hint hint-seriousness">{{ $t('profile.exportAndImport.hint1') }}</p>

    <Modal v-model="importModel" name="import">
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
        <Empty :not-hint="false"></Empty>
      </Card>

      <Row :gutter="10" slot="footer" type="flex" align="middle">
        <Col>
          <p class="hint hint-seriousness">{{ $t('profile.exportAndImport.hint2') }}</p>
        </Col>
        <Col flex="1">
          <Button long :disabled="selectImportPreparationGroup.length <= 0" @click="onImport">Import</Button>
        </Col>
      </Row>
    </Modal>
  </div>
</template>

<script>
import {account_storage, application, storage} from "@/assets/js";
import JSZip from "jszip";

import HtmlWidget from "@/components/HtmlWidget";
import Empty from "@/components/Empty";
import saveAs from "@/assets/js/FileSaver";

export default new application({
  name: "exportAndImport",
  data() {
    return {
      generatedZipLoad: false,
      importModel: false,
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
    this.getLocaleKeys()

    if (!JSZip.support.blob) {
      this.$Message.error('This demo works only with a recent browser !')
    }
  },
  methods: {
    onChangePatternType(value) {
      const app_name = account_storage.STORAGENAME;
      switch (value) {
        case "user":
          this.selectGroup = [
            app_name + 'user.player',
            app_name + 'user.configuration',
            app_name + 'user.subscribes',
            app_name + 'search.history',
            app_name + 'customReply',
            app_name + 'viewed',
          ]
          break
        case "system":
          this.selectGroup = [
            app_name + 'language',
            app_name + 'theme',
          ]
          break
        default:
          this.selectGroup = []
          break
      }
    },
    /**
     * 获取配置
     */
    getLocaleKeys() {
      const keys = account_storage.values();
      this.primitiveStorageKeys = keys;

      this.storageKeys = keys.map(i => ({
        ...i,
        value: i.value,
        label: i.value.split(':')[1],
      }));
      console.log(this.storageKeys)
    },
    /**
     * 导出
     */
    onExport() {
      try {
        if (!this.isLogin || this.selectGroup.length <= 0) return;
        const that = this;
        const zip = new JSZip();

        that.generatedZipLoad = true;

        let dictionary = {}
        for (const storageKey of this.storageKeys) {
          /**
           * exp:
           * {
           *   name: '',
           *   path: ''
           * }
           */
          if (this.selectGroup.indexOf(storageKey.value) >= 0)
            dictionary[storageKey.value] = {
              size: storageKey.data.length ?? 0,
              name: storageKey.value,
              path: 'data/' + storageKey.value + '.json'
            }
        }

        zip.file("dictionary.json", JSON.stringify(dictionary));
        zip.folder("data");

        for (const storageKey of this.storageKeys) {
          if (this.selectGroup.indexOf(storageKey.value) >= 0)
            zip.file("data/" + storageKey.value + '.json', JSON.stringify(storageKey.data))
        }

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

      for (let i = 0; i < files.length; i++) {
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
@import "@/assets/css/hint";

.export-box {
  width: 100%;
  //display: inline-grid;
  //grid-template-columns: repeat(auto-fill, calc(50% - 10px));
  //grid-row-gap: 10px;
  //grid-column-gap: 10px;

  .export-card {
    .export-card-name {
      word-break: break-word;
      text-wrap: normal;
    }
  }
}
</style>
