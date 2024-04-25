import json
import os


class ConfigsManager:

    def __init__(self) -> None:
        with open(os.path.realpath(os.path.join(
            os.path.dirname(__file__), 'configs/configs.json'
        ))) as congigs_file:
            self._configs = json.load(congigs_file)
    
    @property
    def pos_full_names(self):
        return self._configs['POS_FULL_NAMES']
    
    @property
    def spacy_tag_list(self):
        return self._configs['SPACY_TAG_LIST']

