const getters = {
    isLogged: state => state.user !== null,
    isFiles: state => !state.loading && (state.route.name === 'Files' || state.route.name === 'Shares'),
    isListing: (state, getters) => getters.isFiles && state.req.isDir,
    isEditor: (state, getters) => getters.isFiles && (state.req.type === 'text' || state.req.type === 'textImmutable'),
    selectedCount: state => state.selected.length,
    isShare: state => state.isShare,
}

export default getters
