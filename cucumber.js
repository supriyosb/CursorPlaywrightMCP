module.exports = {
    default: {
        requireModule: ['ts-node/register'],
        require: ['features/step-definitions/**/*.ts'],
        format: [
            '@cucumber/pretty-formatter',
            'html:cucumber-report.html'
        ],
        formatOptions: { snippetInterface: 'async-await' },
        timeout: 30000 // 30 seconds timeout
    }
}; 