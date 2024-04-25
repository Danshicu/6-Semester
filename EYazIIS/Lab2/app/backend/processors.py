import pandas as pd
from glob import glob
import os
import spacy

class TextCoprusProcessor:

    def __init__(self, load_existing=False,
                 processing_view=None) -> None:
        self._load_existing = load_existing
        self._load_file_name:str
        if not load_existing:
            self._result_df = pd.DataFrame(columns=['word',
                                                    'lemma',
                                                    'part_of_speech',
                                                    'tag'])
        else:
            self._result_df = self._load_ready()
        self._temp_df_list = []
        spacy.prefer_gpu()
        self._nlp = spacy.load('en_core_web_md')

        # Some status variables for processing
        self._line_count = 0
        self._word_count = 0
        self._ready_status = False

        # Processing view to notify
        self._processing_view = processing_view

    def set_load_file_name(self, name) -> None:
        self._load_file_name = os.path.realpath(os.path.join(os.path.dirname(__file__), 'text_corpus' , name))
    
    def _parse_text_corpus(self) -> None:
        self._line_count = 0
        self._word_count = 0
        self._ready_status = False
        with open(self._load_file_name, encoding='utf-8') as file:                
            for line in file:                     
                parsed_line = self._nlp(line.strip('\n'))
                new_words = {
                    'word': [token.text.lower() if not token.pos_ == 'PROPN' 
                                else token.text for token in parsed_line if token.is_ascii and token.is_alpha],
                    'lemma': [token.lemma_ for token in parsed_line if token.is_ascii and token.is_alpha],
                    'part_of_speech': [token.pos_ for token in parsed_line if token.is_ascii and token.is_alpha],
                    'tag': [token.tag_ for token in parsed_line if token.is_ascii and token.is_alpha]
                }
                temp_df = pd.DataFrame(new_words)
                self._temp_df_list.append(temp_df)
                self._line_count += 1
                self._word_count += len(parsed_line)   
                if self._processing_view:
                    self._processing_view.notify_on_process_status(self.process_status)     
            self._result_df = pd.concat([self._result_df] + self._temp_df_list)
            self._temp_df_list.clear()    
       
    def process_text_corpus(self) -> None:
        if not self._load_existing:
            self._parse_text_corpus()
            self._result_df.sort_values(by='word', inplace=True)
            self._result_df.to_csv(os.path.realpath(os.path.join(
                os.path.dirname(__file__), 'text_corpus_stats/result.csv')), index=False)                
    
    def create_all_main_stats(self) -> None:
        if self._result_df.empty:
            self.process_text_corpus()
        stats_creator = TextCorpusStatsCreator(
            result_df=self._result_df
        )
        stats_creator.create_all_stats()    
        self._ready_status = True
        if self._processing_view:
            self._processing_view.notify_on_process_status(self.process_status)

    def _load_ready(self) -> pd.DataFrame:
        return pd.read_csv(os.path.realpath(os.path.join(
                           os.path.dirname(__file__),
                           'text_corpus_stats/result.csv')),
                          )
    
    @property
    def process_status(self):
        return {
            'lines_processed': self._line_count,
            'words_processed': self._word_count,
            'ready_status': self._ready_status
        }


class TextCorpusStatsCreator:

    def __init__(self, result_df: pd.DataFrame | None = None,
                 load_word_df: bool = False) -> None:
        self._stats_base_path = (os.path.realpath(os.path.join(
            os.path.dirname(__file__), 'text_corpus_stats'
        )))
        if isinstance(result_df, pd.DataFrame):
            self._result_df = result_df
        else:
            self._result_df = pd.read_csv(os.path.realpath(os.path.join(
                self._stats_base_path, 'result.csv'
            )))
        self._word_df: pd.DataFrame | None = None
        if load_word_df:
            self._word_df = pd.read_csv(os.path.realpath(os.path.join(
                self._stats_base_path, 'word_stats.csv'
            ))) 

    def _create_word_stats(self) -> None:
        self._word_df = self._result_df
        self._word_df['absolute_frequency'] = (self._word_df.groupby(by=['word', 'tag'])
                                               ['lemma'].transform('count'))
        self._word_df.drop_duplicates(inplace=True)                                        
        self._word_df.to_csv(os.path.realpath(os.path.join(
                      self._stats_base_path, 'word_stats.csv')), index=False
                      )
    
    def _create_lemma_stats(self):
        result = (self._word_df.groupby(by=['lemma', 'part_of_speech'])
                  .agg({'absolute_frequency': 'sum'}).reset_index())
        result.to_csv(os.path.realpath(os.path.join(
            self._stats_base_path, 'lemma_stats.csv'
        )), index=False)

    def _create_pos_stats(self):
        result = (self._word_df.groupby(by=['part_of_speech'])
                  .agg({'absolute_frequency': 'count'}).reset_index())
        result.to_csv(os.path.realpath(os.path.join(
            self._stats_base_path, 'pos_stats.csv'
        )), index=False)

    def _create_tag_stats(self):
        result = (self._word_df.groupby(by=['tag'])
                  .agg({'absolute_frequency': 'count'}).reset_index())
        result.to_csv(os.path.realpath(os.path.join(
            self._stats_base_path, 'tag_stats.csv'
        )), index=False)    

    def create_all_stats(self):
        self._create_word_stats()
        self._create_lemma_stats()
        self._create_pos_stats()
        self._create_tag_stats()
    
    def recount_auto_created_stats(self):
        '''Recount stats that could be created
        only automatically (lemma, pos and tag stats)'''
        self._create_lemma_stats()
        self._create_pos_stats()
        self._create_tag_stats()


class TextCorpusQueryHandler:
    
    def __init__(self) -> None:
        self._nlp = spacy.load('en_core_web_md')        
        self._stats_base_path = (os.path.realpath(os.path.join(
            os.path.dirname(__file__), 'text_corpus_stats'
        )))          
    
    def query_word_stats(self, phrase: str):        
        word_df = pd.read_csv(os.path.realpath(os.path.join(
            self._stats_base_path, 'word_stats.csv'
        )))
        lemma_df = pd.read_csv(os.path.realpath(os.path.join(
            self._stats_base_path, 'lemma_stats.csv'
        )))
        tokens = self._nlp(phrase)
        result_stats = {}
        for token in tokens:
            word = (token.text if token.pos_ == 'PROPN'
                    else token.text.lower())
            lemma_frequency = lemma_df[(lemma_df['lemma'] == token.lemma_) &
                                       (lemma_df['part_of_speech'] == token.pos_)]
            lemma_frequency = 0 if lemma_frequency.empty else lemma_frequency.iloc[0, -1]
            word_forms_stats_df = word_df[(word_df['lemma'] == token.lemma_) &
                                          (word_df['part_of_speech'] == token.pos_)]
            word_forms_stats_dict = {}
            for row in word_forms_stats_df.values:                
                word_forms_stats_dict[row[0]] = {'tag': row[3],
                                                 'word_frequency': row[4]
                                                }            
            result_stats[word] = {
                'lemma': token.lemma_,
                'lemma_frequency': lemma_frequency,
                'word_forms_stats': word_forms_stats_dict 
            }
        return result_stats
    
    def query_pos_tag_stats(self):
        pos_df = pd.read_csv(os.path.realpath(os.path.join(
            self._stats_base_path, 'pos_stats.csv'
        )))
        tag_df = pd.read_csv(os.path.realpath(os.path.join(
            self._stats_base_path, 'tag_stats.csv'
        )))
        result_stats = {
            'pos': {row[0]: row[1] for row in pos_df.values},
            'tag': {row[0]: row[1] for row in tag_df.values}
        }
        return result_stats
    
    def get_raw_word_df(self):
        word_df = pd.read_csv(os.path.realpath(os.path.join(
            self._stats_base_path, 'word_stats.csv'
        )))
        return word_df

    def set_raw_word_df(self, word_df: pd.DataFrame):
        word_df.to_csv(os.path.realpath(os.path.join(
                self._stats_base_path, 'word_stats.csv')), index=False
        )
        stats_creator = TextCorpusStatsCreator(
            result_df=None, load_word_df=True
        )
        stats_creator.recount_auto_created_stats()


class TextCorpusUploader:

    def __init__(self, view_to_notify=None) -> None:
        self._stats_base_path = (os.path.realpath(os.path.join(os.path.dirname(__file__), 'text_corpus')))
        self._upload_status = False
        self._view_to_notify = view_to_notify
    
    def upload_text(self, file):
        self._upload_status = False
        file_path = os.path.realpath(os.path.join(self._stats_base_path, file.name))
        with open(file_path, 'r'):
            file.read()
        self._upload_status = True
        if self._view_to_notify:
            self._view_to_notify.notify_on_upload_end()
