import streamlit as st
from app.backend.processors import TextCoprusProcessor, TextCorpusUploader


class UpdateTextCorpusView:
    
    def __init__(self) -> None:
        st.set_page_config(page_title='Upload new texts to text corpus', layout='wide')
        if not st.session_state.get('text_corpus_processor'):
            st.session_state['text_corpus_processor'] = TextCoprusProcessor(processing_view=self)
        if not st.session_state.get('text_corpus_uploader'):
            st.session_state['text_corpus_uploader'] = TextCorpusUploader(view_to_notify=self)
        st.session_state['status_placeholder'] = st.empty()

    def run(self):
        st.write('### Upload new texts to corpus to process')
        uploaded_text = st.file_uploader(label='Upload texts here',
                                          type='txt', accept_multiple_files=False,
                                          key='text_corpus_file_uploader',
                                          help='Upload new files in text coprus '
                                          'to process')
        update_corpus_btn = st.button(label='Upload texts to corpus',
                                      key='update_corpus_btn',
                                      help='Press this button after '
                                      'uploading all of wanted files. '
                                      'Updating process will start after that. '
                                      'Be warned that updating process '
                                      'could take really long time depending on '
                                      'size of files user uploads.',
                                      on_click=lambda: self._update_text_corpus(uploaded_text))
    
    def _update_text_corpus(self, uploaded_file):
        st.session_state.get('text_corpus_uploader').upload_text(uploaded_file)
        st.session_state.get('text_corpus_processor').set_load_file_name(uploaded_file.name)
    
    def _begin_processing(self):
        st.session_state.get('text_corpus_processor').create_all_main_stats()
    
    def notify_on_upload_end(self):        
        st.success('All of your files were successfully uploaded!\n'
                'Beginning of processing process...')
        begin_processing_btn = st.button(label='Begin processing?',
                                        key='begin_process_btn',
                                        help='After pressing that button, '
                                        'processing will start. It could '
                                        'take really long time before finish.',
                                        on_click=self._begin_processing)         
    
    def notify_on_process_status(self, process_status: dict):
        if process_status['ready_status']:
            with st.session_state.get('status_placeholder'):
                st.success(f'Processing finished successfully!\n'
                        f'Processed words amount: {process_status['words_processed']}\n'
                        f'Processed lines amount: {process_status['lines_processed']}')
        else:
            with st.session_state.get('status_placeholder'):
                st.warning(f'Processing is still going!\n'
                        f'Processed words amount: {process_status['words_processed']}\n'
                        f'Processed lines amount: {process_status['lines_processed']}')


update_text_corpus_view = UpdateTextCorpusView()
update_text_corpus_view.run()
