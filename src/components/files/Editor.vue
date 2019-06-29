<template>
    <form>
        <textarea id="editor"></textarea>
    </form>
</template>

<script>
    import {mapState} from 'vuex'
    import {files as api} from '@/api'
    import buttons from '@/utils/buttons'

    export default {
        name: 'editor',
        computed: {
            ...mapState(['req']),

        },
        data: function () {
            return {
            }
        },
        created() {
            window.addEventListener('keydown', this.keyEvent)
            document.getElementById('save-button').addEventListener('click', this.save)
        },
        beforeDestroy() {
            window.removeEventListener('keydown', this.keyEvent)
            document.getElementById('save-button').removeEventListener('click', this.save)
        },
        mounted() {
            if (this.req.content === undefined || this.req.content === null) {
                this.req.content = ''
            }
            if (this.req.extension) {
                this.req.language = this.getLang;
            }
            var editor = document.getElementById('editor')
            editor.value = this.req.content
            editor.addEventListener('input', ()=>autoresize(editor), false);


            function autoresize(editor) {
                editor.style.height = 'auto'
                editor.style.height = editor.scrollHeight + 'px'
                editor.scrollTop = editor.scrollHeight
                window.scrollTo(window.scrollLeft, (editor.scrollTop + editor.scrollHeight))
            }

            autoresize(editor)
        },
        methods: {
            keyEvent(event) {
                if (!event.ctrlKey && !event.metaKey) {
                    return
                }

                if (String.fromCharCode(event.which).toLowerCase() !== 's') {
                    return
                }

                event.preventDefault()
                this.save()
            },
            async save() {
                const button = 'save'
                buttons.loading('save')
                let content = document.getElementById("editor").value

                try {
                    await api.put(this.$route.path, content)
                    buttons.success(button)
                } catch (e) {
                    buttons.done(button)
                    this.$showError(e)
                }
            }
        }
    }
</script>
