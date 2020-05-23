export default {
  methods: {
    axiosReqestError(title, text) {
      this.$notify({
        title,
        text,
        position: 'bottom left'
      })
    },
    axiosReqestSuccess(title, text) {
      this.$notify.success({
        title,
        text,
        position: 'bottom left'
      })
    }
  }
}
