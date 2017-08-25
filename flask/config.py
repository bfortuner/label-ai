
import os

ENDPOINT = 'http://10.0.0.21:5000'
IMG_ENDPOINT = ENDPOINT + '/image'

PROJECT_PATH = '/bigguy/data/dogscats'
MEDIA_PATH = PROJECT_PATH + '/datasets/inputs/trn_jpg'
METADATA_FPATH = os.path.join(PROJECT_PATH, 'labelai.csv')
FOLD_FPATH = os.path.join(PROJECT_PATH, 'labelai.json')

TRAIN = 'trn'
VAL = 'val'
TEST = 'tst'
UNLABELED = 'unlabeled'

IMG_EXT = '.jpg'

DEFAULT_WIDTH = 300
DEFAULT_HEIGHT = 300
BATCH_SIZE = 50
VAL_FOLD_RATIO = 0.2