<template>
    <form id="editor" :class="getLang">
    </form>
</template>

<script>
    import {mapState} from 'vuex'
    import {files as api} from '@/api'
    import buttons from '@/utils/buttons'
    import CodeMirror from '@/utils/codemirror-setup'

    export default {
        name: 'editor',
        computed: {
            ...mapState(['req']),
            getLang() {
                let mode = ""
                switch (this.req.extension) {
                    case 'md', 'markdown', 'mdown', 'mmark':
                        mode = 'markdown'
                        break
                    case 'yml':
                        mode = 'yaml'
                        break
                    case 'asciidoc', 'adoc', 'ad':
                        mode = 'asciidoc'
                        break
                    case 'rst':
                        mode = 'rst'
                        break
                    case 'html', 'htm', 'xml':
                        mode = 'htmlmixed'
                        break
                    case 'js':
                        mode = 'javascript'
                        break
                    case 'go':
                        mode = 'golang'
                        break
                    case '':
                        mode = 'text'
                        break
                }
                return mode;
            }
        },
        data: function () {
            return {
                metadata: null,
                metalang: null,
                editor: null
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
        mounted () {
            if (this.req.content === undefined || this.req.content === null) {
                this.req.content = ''
            }
            if (this.req.extension) {
                this.req.language = this.getLang;
            }

            this.editor = CodeMirror(document.getElementById('editor'), {
                value: this.req.content,
                lineNumbers: (this.req.language !== 'markdown'),
                viewportMargin: 500,
                autofocus: true,
                mode: this.req.language,
                theme: (this.req.language === 'markdown') ? 'markdown' : 'ttcn',
                lineWrapping: (this.req.language === 'markdown')
            })
            CodeMirror.autoLoadMode(this.editor, 'content')

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
                let content = this.editor.getValue()
                if (this.hasMetadata) {
                    content = this.metadata.getValue() + '\n\n' + content
                }
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
