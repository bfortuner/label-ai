import os
import pandas as pd
from collections import namedtuple, OrderedDict

import utils.files
import config as cfg


DEFAULT_COLS = ['id','labels','model_labels']



def init_dataset(inputs_dir, fold_fpath, file_ext, label_names=None):
    fpaths, ids = utils.files.get_paths_to_files(inputs_dir, strip_ext=True)
    label_names = [] if label_names is None else label_names
    fold = {
        'file_ext': file_ext,
        'inputs_dir': inputs_dir,
        'label_names': sorted(label_names),
        'trn': {},
        'val': {},
        'tst': {}, #auditing purposes
        'unlabeled': {} #these need to be queried and popped by key
    }
    for id_ in ids:
        fold['unlabeled'][id_] = id_
    save_fold(fold_fpath, fold)
    return fold


def make_entry(labels=None, model_labels=None, model_probs=None):
    labels = [] if labels is None else labels
    model_labels = [] if model_labels is None else model_labels
    model_probs = [] if model_probs is None else model_probs
    return {
        'labels': labels,
        'model_labels': model_labels,
        'model_probs': model_probs,
    }


def add_or_update_entry(fold, dset, id_, entry):
    fold[dset][id_] = entry


def move_unlabeled_to_labeled(fold, dset, id_, entry):
    del fold['unlabeled'][id_]
    add_or_update_entry(fold, dset, id_, entry)


def save_fold(fpath, fold):
    utils.files.save_json(fpath, fold)

    
def load_fold(fpath):
    return utils.files.load_json(fpath)


def img_url(fname):
    return cfg.IMG_ENDPOINT + '/{:s}'.format(fname + cfg.IMG_EXT)


def get_stats(project_name):
    return {
        'counts': {
            'labeled': 20,
            'model_labeled': 1000,
            'trn': 20,
            'val': 1000,
            'tst': 20
        },
        'metrics': {
            'accuracy': {
                'trn': .98,
                'val': .23,
                'tst': .45
            },
            'loss': {
                'trn': .98,
                'val': .23,
                'tst': .45
            }
        }
    }


# Pandas 

def init_dataset_df(meta_fpath, input_dir):
    fpaths, ids = utils.files.get_paths_to_files(input_dir, strip_ext=True)
    data = []
    for id_ in ids:
        data.append([id_,'',''])
    df = pd.DataFrame(data, columns=DEFAULT_COLS)
    df = df.set_index('id')
    save_metadata_df(df, meta_fpath)
    return df

def save_metadata_df(df, fpath):
    df.to_csv(fpath, index=True, columns=DEFAULT_COLS[1:])


def get_row_by_id(df, id_):
    if id_ in df.index:
        return df.loc[id_]
    return None


def insert_or_append_df(df, id_, values):
    df.loc[id_] = values
    return df


def load_metadata_df(fpath):
    df = pd.read_csv(fpath, header=0, 
                     names=DEFAULT_COLS, index_col=DEFAULT_COLS[0])
    df = df.fillna(value='')
    return df