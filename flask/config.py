
import os

PROJECT_PATH = '/bigguy/data/dogscats'
MEDIA_PATH = PROJECT_PATH + '/datasets/inputs/trn_jpg'
ENDPOINT = 'http://10.0.0.21:5000'
IMG_ENDPOINT = ENDPOINT + '/image'

METADATA_FPATH = os.path.join(PROJECT_PATH, 'labelai.csv')
FOLD_FPATH = os.path.join(PROJECT_PATH, 'folds', 'labelai.json')

TRAIN = 'trn'
VAL = 'val'
TEST = 'tst'
UNLABELED = 'unlabeled'

IMG_EXT = '.jpg'

DEFAULT_WIDTH = 300
DEFAULT_HEIGHT = 300