import os
import pandas as pd
from collections import namedtuple, OrderedDict

import utils.files
import config as cfg


DSET_FOLD_FILE_EXT = '.json'
DEFAULT_COLS = ['id','labels','model_labels']




def load_metadata_df(fpath):
    df = pd.read_csv(fpath, header=0, 
                     names=DEFAULT_COLS, index_col=DEFAULT_COLS[0])
    df = df.fillna(value='')
    return df


def save_metadata_df(df, fpath):
    df.to_csv(fpath, index=True, columns=DEFAULT_COLS[1:])


def get_row_by_id(df, id_):
    if id_ in df:
        return df.loc[id_]
    return None


def insert_or_append_df(df, id_, values, columns=DEFAULT_COLS[1:]):
    row = pd.DataFrame([values], columns=columns)
    df.loc[id_] = values
    return df


def save_fold(fpath, fold):
    utils.files.save_json(fpath, fold)

    
def load_fold(fpath):
    return utils.files.load_json(fpath)


def img_url(fname):
    return cfg.IMG_ENDPOINT + '/{:s}'.format(fname + cfg.IMG_EXT)

