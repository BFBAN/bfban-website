<template>
  <div>
    <Row>
      <Col :xs="{span: 22, push: 1, pull: 1}">
        <table>
          <tbody>
          <tr v-for="activity in activities" :key="activity.id">
            <td nowrap>
              <Time v-if="activity.createDatetime" :time="activity.createDatetime"></Time>
            </td>
            <td v-if="activity.type === 'report'">
              <span>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{
                    activity.username
                  }}</router-link>
                举报了
                <Tag>
                  {{ handleGameName(activity.game) }}
                </Tag>
                <router-link
                  :to="{name: 'cheater', params: {game: `${activity.game}`, ouid: `${activity.originUserId}`}}">{{
                    activity.cheaterOriginId
                  }}</router-link>
              </span>

            </td>

            <td v-if="activity.type === 'register'">
              <span>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{
                    activity.username
                  }}</router-link>
                注册了 bfban ，
                欢迎！
              </span>

            </td>

            <td v-if="activity.type === 'verify'">
              <span>
                <Tag color="success">管理员</Tag>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{
                    activity.username
                  }}</router-link>
                将
                <router-link :to="{name: 'cheater', params: {ouid: `${activity.originUserId}`}}">{{
                    activity.cheaterOriginId
                  }}</router-link>
                处理为
                <Tag color="warning">
                  {{ handleStatus(activity.status) }}
                </Tag>
              </span>

            </td>
          </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {
  name: "Home_activities"
}
</script>

<style scoped>

</style>
