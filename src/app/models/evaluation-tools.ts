
export const EvaluationTools = {
  '9a3b4f7b-50a7-4ab5-a2fb-bebdb780a2c5' : {
    'name': 'Conversation Analysis Tool',
    'description': '\
Please note that this tool should be used to observe and formatively assess *two-person academic conversations*. \
The tool was not created with individual speakers or groups of students in mind. The tool works best with student conversations that \
have been recorded and transcribed, although teachers are welcome to take notes directly on the tool or adapt it to meet their needs.',

    'dimensions': {

      '228eb5bf-b194-4ac8-a1d0-07a947f3e20b': {
        'title': 'Students take appropriate turns to construct a conversation',
        'index': 0,
        'levels': {
          '1': {
            'label': 'No attempt',
            'rubric': 'Students do not take conversational turns during the interaction.'
          },
          '2': {
            'label': 'Attempting interaction',
            'rubric': '\
Students rarely start and stop their conversational turns appropriately, or one student talks too much during most turns.'
          },
          '3': {
            'label': 'Inconsistent evidence',
            'rubric': '\
Students engage in some appropriate conversational turns, but at times either student might interrupt, pause mid-turn, \
not talk when appropriate, talk too much during one or several turns, or display other awkward behaviors.'
          },
          '4': {
            'label': 'Strong evidence',
            'rubric': '\
Students appropriately (speaking one at a time, not interrupting, etc.) start and stop their conversational turns throughout \
the interaction, and they contribute more or less equally.'
          }
        },
        'isOptional': true
      },

      '6fef8291-4cf3-41b2-aaef-192198b5b381': {
        'title': 'Turns build on previous turns to build up an idea',
        'index': 1,
        'levels': {
          '1': {
            'label': 'No attempt',
            'rubric': 'Conversational turns are not used to build up an idea.'
          },
          '2': {
            'label': 'Attempting interaction',
            'rubric': 'Few conversational turns build on previous turns to build up an idea.'
          },
          '3': {
            'label': 'Inconsistent evidence',
            'rubric': '\
Half or more of the conversational turns build on previous turns to adequately build up an idea, which may be incomplete or lack clarity.'
          },
          '4': {
            'label': 'Strong evidence',
            'rubric': 'Half or more of the conversational turns build on previous turns to effectively build up a clear and complete idea.'
          }
        },
        'isOptional': false
      },

      '30722dae-d3c3-45d2-8c80-e98795956d5e': {
        'title': 'Turns focus on content or skills related to the lesson objectives',
        'index': 2,
        'levels': {
          '1': {
            'label': 'No attempt',
            'rubric': 'Conversational turns do not focus on the lesson objectives.'
          },
          '2': {
            'label': 'Attempting interaction',
            'rubric': 'Few conversational turns focus on the lesson objectives.'
          },
          '3': {
            'label': 'Inconsistent evidence',
            'rubric': '\
Half or more of the conversational turns sufficiently focus on the lesson objectives, but this focus may be superficial or lack clarity.'
          },
          '4': {
            'label': 'Strong evidence',
            'rubric': '\
Half or more of the conversational turns effectively focus on the lesson objectives and show depth or fostering of the intended learning.'
          }
        },
        'isOptional': false
      }

    }
  }
};
