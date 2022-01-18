
export function createDownloadATag(exportText){
    const textName = 'ExpCsv' + today + '.csv'
    const today = Date(Date.now())
    const blob = new Blob([exportText],{type:'text/plain'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = textName
    return link
}
